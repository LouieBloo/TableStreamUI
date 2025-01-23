import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { PlayingCard } from '../../../interfaces/scryfall';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { debounceTime, firstValueFrom, Subject, Subscription } from 'rxjs';
import { IMongoImage } from '../../../interfaces/dev';
import { CardSearchService } from '../../../services/search/card-search.service';
import { CardComponent } from '../../card/card.component';
import { AlertsService } from '../../../services/alerts/alerts.service';

@Component({
  selector: 'app-dev-classify',
  standalone: true,
  imports: [ NgClass, NgIf, NgFor, FormsModule, CardComponent],
  templateUrl: './dev-classify.component.html',
  styleUrl: './dev-classify.component.css'
})
export class DevClassifyComponent {
  images: IMongoImage[] = [];
  currentImage!: IMongoImage;
  currentIndex: number = -1;

  scryfallSearchQuery: string = '';
  searching:boolean = false;
  searchResults:PlayingCard[] = []
  selectedCard: PlayingCard | null = null;
  message: string = '';
  loadingMoreImages:boolean = false;
  isFlipped:boolean = false;
  showHints:boolean = false;

  searchSubscription: Subscription | null = null;

  cardBeingHovered!:PlayingCard;

  private searchSubject = new Subject<string>();

  password:any = {
    value:"",
    initialSubmit:false
  }

  constructor(private http: HttpClient,private cardSearchService:CardSearchService, private alerts:AlertsService) {
    // Subscribe to the search subject with debounce
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      console.log('Search term:', searchTerm);
      this.searchScryfall(searchTerm);
    });
  }

  ngOnInit() {
    this.password.value = localStorage.getItem("dev-pw");
  }

  async loadImages(): Promise<void> {
    this.loadingMoreImages = true;
    try {
      localStorage.setItem("dev-pw", this.password.value);

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

  searchScryfall(searchTerm:string) {
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
      .get<{ data: PlayingCard[] }>(
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

  onCardHover = (card: PlayingCard | null)=>{
    if(!card){return}
    this.cardBeingHovered = card;
  }

  selectCard(card: PlayingCard) {
    this.selectedCard = card;
  }

  async deleteImage(){
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.delete<any>(`${environment.socketUrl}/classify/train/images/${this.currentImage._id}`,{headers})
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
      this.currentImage = this.images[this.currentIndex];
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
      this.currentImage = this.images[this.currentIndex];
    } while (this.hasSeenImage(this.currentImage._id) && this.currentIndex !== initialIndex);
  
    this.selectedCard = null;
  }

  private updateSeenImages(): void {
    const seenImages = this.getSeenImages();
    if (!seenImages.includes(this.currentImage._id)) {
      seenImages.push(this.currentImage._id);
      localStorage.setItem('seenImages', JSON.stringify(seenImages));
    }
  }
  
  private getSeenImages(): string[] {
    const stored = localStorage.getItem('seenImages');
    return stored ? JSON.parse(stored) : [];
  }
  
  hasSeenImage(imageId: string): boolean {
    const seenImages = this.getSeenImages();
    return seenImages.includes(imageId);
  }

  clearCache(): void {
    localStorage.removeItem('seenImages');
    console.log('Seen images cache cleared.');
  }

  getCurrentImageUrl(): string {
    return `${environment.socketUrl}/image/${this.currentImage}`;
  }

  voteToDelete(){
    let image:IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if(!image.votesToDelete){image.votesToDelete = 0}
    image.votesToDelete++;
    this.saveImage(image);
  }

  overrideDelete(){
    let image:IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    image.votesToDelete = 3;
    this.saveImage(image);
  }

  imNotSure(){
    let image:IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if(!image.votesNotSure){image.votesNotSure = 0}
    image.votesNotSure++;
    this.saveImage(image);
  }

  submitMatch(forceMatch:boolean = false){
    if(!this.selectedCard){return;}
    let image:IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
    if(!image.possibleOracleIds){image.possibleOracleIds = []}
    image.possibleOracleIds.push(this.selectedCard.id);

    if(forceMatch){
      image.possibleOracleIds = [this.selectedCard.id,this.selectedCard.id,this.selectedCard.id]
    }

    this.saveImage(image);
  }

  async saveImage(image:IMongoImage){
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.patch<any>(`${environment.socketUrl}/classify/train/images/${image._id}`,image,{ headers } )
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
