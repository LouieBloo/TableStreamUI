import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { IPlayingCard } from '../../../interfaces/IPlayingCard';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { debounceTime, firstValueFrom, Subject, Subscription } from 'rxjs';
import { IMongoImage } from '../../../interfaces/IDev';
import { CardSearchService } from '../../../services/search/card-search.service';
import { CardComponent } from '../../card/card.component';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';

@Component({
  selector: 'app-dev-classify',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CardComponent],
  templateUrl: './dev-classify.component.html',
  styleUrl: './dev-classify.component.css'
})
export class DevClassifyComponent {
  images: IMongoImage[] = [];
  currentImage!: IMongoImage;
  currentIndex: number = -1;

  scryfallSearchQuery: string = '';
  searching: boolean = false;
  searchResults: IPlayingCard[] = []
  selectedCard: IPlayingCard | null = null;
  message: string = '';
  loadingMoreImages: boolean = false;
  loadingScryfallSearchById: boolean = false;
  isFlipped: boolean = false;
  showHints: boolean = false;
  currentCardClassifierGuessedButtonsEnabled: boolean = false;

  searchSubscription: Subscription | null = null;
  searchByIdSubscription: Subscription | null = null;

  cardBeingHovered!: IPlayingCard;
  cardClassifierGuessed!:IPlayingCard | null;

  private searchSubject = new Subject<string>();

  password: any = {
    value: "",
    initialSubmit: false
  }

  constructor(private http: HttpClient, private cardSearchService: CardSearchService, private alerts: AlertsService, private localStorageService: LocalStorageService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      console.log('Search term:', searchTerm);
      this.searchScryfall(searchTerm);
    });
  }

  ngOnInit() {
    this.password.value = this.localStorageService.devPassword;
  }

  async loadImages(): Promise<void> {
    this.loadingMoreImages = true;
    try {
      this.localStorageService.setDevPassword(this.password.value);
      let params = new HttpParams();

      params = params.set('imageType', 'CARD');
      params = params.set('status', 'PENDING_CLASSIFICATION');
      params = params.set('randomizeResults', true);
      params = params.set('maxImages', 5);

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.get<IMongoImage[]>(`${environment.socketUrl}/classify/train/images`, { params, headers })
      );

      this.images = this.images.concat(data);

      this.nextImage();
    } catch (error) {
      console.error('Error loading images:', error);
    }

    this.loadingMoreImages = false;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value); // Push value to the Subject
  }

  searchScryfall(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.searchResults = [];
      return;
    }

    // Cancel the previous search if it exists
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.searching = true;
    const query = encodeURIComponent(searchTerm);
    this.searchSubscription = this.http
      .get<{ data: IPlayingCard[] }>(
        `https://api.scryfall.com/cards/search?q=${query}`
      )
      .subscribe(
        (response) => {
          this.searchResults = response.data;
          this.searching = false;
          this.searchSubscription = null;
        },
        (error) => {
          console.error(error);
          this.searching = false;
          this.searchSubscription = null;
        }
      );
  }

  searchScryfallById(oracleId: string) {
    if (this.searchByIdSubscription) {
      this.searchByIdSubscription.unsubscribe();
    }

    this.loadingScryfallSearchById = true;
    this.searchByIdSubscription = this.cardSearchService.searchByOracleId(oracleId).subscribe({
      next: (data) => {
        this.cardClassifierGuessed = data && data.data && data.data.length > 0 ? data.data[0] : null;
        this.searchByIdSubscription = null;
        this.loadingScryfallSearchById = false;
      },
      error: (err) => {
        console.error('Error fetching card:', err);
        this.cardClassifierGuessed = null;
        this.searchByIdSubscription = null;
        this.loadingScryfallSearchById = false;
      }
    });
  }

  onCardHover = (card: IPlayingCard | null) => {
    if (!card) { return }
    this.cardBeingHovered = card;
  }

  selectCard(card: IPlayingCard) {
    this.selectedCard = card;
  }

  async deleteImage() {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.delete<any>(`${environment.socketUrl}/classify/train/images/${this.currentImage._id}`, { headers })
      );

      this.alerts.addAlert("success", "Image deleted")

      this.nextImage();
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  nextImage(): any {
    let initialIndex = this.currentIndex;

    do {
      this.currentIndex++;
      if (this.currentIndex > this.images.length - 1) {
        // this.currentIndex = 0;
        this.currentIndex--;
        return this.loadImages();
      }
      // this.currentImage = this.images[this.currentIndex];
      this.setCurrentImage(this.currentIndex);
    } while (this.hasSeenImage(this.currentImage._id) && this.currentIndex !== initialIndex);

    this.selectedCard = null;
  }

  previousImage(): void {
    let initialIndex = this.currentIndex;

    do {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.images.length - 1;
      }
      // this.currentImage = this.images[this.currentIndex];
      this.setCurrentImage(this.currentIndex);
    } while (this.hasSeenImage(this.currentImage._id) && this.currentIndex !== initialIndex);

    this.selectedCard = null;
  }

  setCurrentImage = (index: number) => {
    this.currentImage = this.images[index];
    
    if(this.currentImage.classifierScryfallIdGuess){
      this.currentCardClassifierGuessedButtonsEnabled = true;
      this.searchScryfallById(this.currentImage.classifierScryfallIdGuess);
    }else{
      this.currentCardClassifierGuessedButtonsEnabled = false;
      this.cardClassifierGuessed = null;
    }
  }

  private updateSeenImages(): void {
    const seenImages = this.getSeenImages();
    if (!seenImages.includes(this.currentImage._id)) {
      seenImages.push(this.currentImage._id);
      this.localStorageService.setSeenImages(JSON.stringify(seenImages))
    }
  }

  private getSeenImages(): string[] {
    const stored = this.localStorageService.seenImages;
    return stored ? JSON.parse(stored) : [];
  }

  
  hasSeenImage(imageId: string): boolean {
    const seenImages = this.getSeenImages();
    return seenImages.includes(imageId);
  }

  removeSeenImagesFromStorage(): void {
    this.localStorageService.removeSeenImages();
  }

  getCurrentImageUrl(): string {
    return `${environment.socketUrl}/image/${this.currentImage}`;
  }

  classifierGuessedCorrectly = ()=>{
    this.submitMatch(this.cardClassifierGuessed?.id, true)
  }

  classifierGuessedIncorrectly = ()=>{
    this.currentCardClassifierGuessedButtonsEnabled = false;
  }

  voteToDelete() {
    let image: IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if (!image.votesToDelete) { image.votesToDelete = 0 }
    image.votesToDelete++;
    this.saveImage(image);
  }

  overrideDelete() {
    let image: IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    image.votesToDelete = 3;
    this.saveImage(image);
  }

  imNotSure() {
    let image: IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if (!image.votesNotSure) { image.votesNotSure = 0 }
    image.votesNotSure++;
    this.saveImage(image);
  }

  submitMatch(correctCardId:string | undefined, forceMatch: boolean = false) {
    if (!correctCardId) { return; }
    let image: IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if (!image.possibleOracleIds) { image.possibleOracleIds = [] }
    image.possibleOracleIds.push(correctCardId);

    if (forceMatch) {
      image.possibleOracleIds = [correctCardId, correctCardId, correctCardId]
    }

    this.saveImage(image);
  }

  async saveImage(image: IMongoImage) {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.patch<any>(`${environment.socketUrl}/classify/train/images/${image._id}`, image, { headers })
      );

      this.alerts.addAlert("success", "Image Saved")

      this.updateSeenImages();

      this.nextImage();
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  // saveImage() {
  //   if (!this.selectedCard) {
  //     alert('Please select a card from the search results.');
  //     return;
  //   }

  //   // Get the next augmentation number from the backend
  //   this.http
  //     .get<{ nextAugmentationNumber: number }>(
  //       `${environment.socketUrl}/next-augmentation-number/${this.selectedCard.id}`
  //     )
  //     .subscribe(
  //       (response) => {
  //         const augmentationNumber = response.nextAugmentationNumber;

  //         // Save the image via the backend
  //         this.http
  //           .post(environment.socketUrl + '/save-image', {
  //             imageFilename: this.currentImage,
  //             scryfallId: this.selectedCard?.id,
  //             augmentationNumber: augmentationNumber,
  //           })
  //           .subscribe(
  //             (response) => {
  //               this.moveToNextImage();
  //             },
  //             (error) => {
  //               console.error(error);
  //               alert('Error saving image.');
  //             }
  //           );
  //       },
  //       (error) => {
  //         console.error(error);
  //         alert('Error getting next augmentation number.');
  //       }
  //     );
  // }
}
