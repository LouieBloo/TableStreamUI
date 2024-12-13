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
  images!: IMongoImage[];
  currentImage!: IMongoImage;
  currentIndex: number = 0;

  scryfallSearchQuery: string = '';
  searching:boolean = false;
  searchResults:PlayingCard[] = []
  selectedCard: PlayingCard | null = null;
  message: string = '';

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
  }

  async loadImages(): Promise<void> {
    try {
      let params = new HttpParams();

      params = params.set('imageType', 'CARD');
      params = params.set('status', 'PENDING_CLASSIFICATION');

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.get<IMongoImage[]>(`${environment.socketUrl}/classify/train/images`, { params, headers })
      );
      this.images = data;
      if (this.images.length > 0) {
        this.currentImage = this.images[this.currentIndex];
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
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

    this.searching = true;
    const query = encodeURIComponent(searchTerm);
    this.http
      .get<{ data: PlayingCard[] }>(
        `https://api.scryfall.com/cards/search?q=${query}`
      )
      .subscribe(
        (response) => {
          this.searchResults = response.data;
          this.searching = false;
        },
        (error) => {
          console.error(error);
          this.searching = false;
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

  previousImage(){
    this.currentIndex--;
    if(this.currentIndex < 0){
      this.currentIndex = this.images.length-1;
    }

    this.currentImage = this.images[this.currentIndex];
    this.selectedCard = null;
  }

  nextImage(){
    this.currentIndex++;
    if(this.currentIndex > this.images.length -1){
      this.currentIndex = 0;
    }

    this.currentImage = this.images[this.currentIndex];
    this.selectedCard = null;
  }

  getCurrentImageUrl(): string {
    return `${environment.socketUrl}/image/${this.currentImage}`;
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
