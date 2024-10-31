import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ScryfallCard } from '../../../interfaces/scryfall';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dev-classify',
  standalone: true,
  imports: [ NgClass, NgIf, NgFor, FormsModule],
  templateUrl: './dev-classify.component.html',
  styleUrl: './dev-classify.component.css'
})
export class DevClassifyComponent {
  images: string[] = [];
  currentIndex: number = 0;
  currentImage: string = '';
  scryfallSearchQuery: string = '';
  searchResults: ScryfallCard[] = [];
  selectedCard: ScryfallCard | null = null;
  message: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.http.get<string[]>(environment.socketUrl + '/images').subscribe(
      (data) => {
        this.images = data;
        if (this.images.length > 0) {
          this.currentImage = this.images[this.currentIndex];
        } else {
          this.message = 'No images found in the input directory.';
        }
      },
      (error) => {
        console.error(error);
        this.message = 'Error loading images.';
      }
    );
  }

  searchScryfall() {
    if (this.scryfallSearchQuery.trim() === '') {
      this.searchResults = [];
      return;
    }

    const query = encodeURIComponent(this.scryfallSearchQuery);
    this.http
      .get<{ data: ScryfallCard[] }>(
        `https://api.scryfall.com/cards/search?q=${query}`
      )
      .subscribe(
        (response) => {
          this.searchResults = response.data;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  selectCard(card: ScryfallCard) {
    this.selectedCard = card;
  }

  saveImage() {
    if (!this.selectedCard) {
      alert('Please select a card from the search results.');
      return;
    }

    // Get the next augmentation number from the backend
    this.http
      .get<{ nextAugmentationNumber: number }>(
        `${environment.socketUrl}/next-augmentation-number/${this.selectedCard.id}`
      )
      .subscribe(
        (response) => {
          const augmentationNumber = response.nextAugmentationNumber;

          // Save the image via the backend
          this.http
            .post(environment.socketUrl + '/save-image', {
              imageFilename: this.currentImage,
              scryfallId: this.selectedCard?.id,
              augmentationNumber: augmentationNumber,
            })
            .subscribe(
              (response) => {
                this.moveToNextImage();
              },
              (error) => {
                console.error(error);
                alert('Error saving image.');
              }
            );
        },
        (error) => {
          console.error(error);
          alert('Error getting next augmentation number.');
        }
      );
  }

  moveToNextImage() {
    this.currentIndex++;
    if (this.currentIndex < this.images.length) {
      this.currentImage = this.images[this.currentIndex];
      this.selectedCard = null;
      this.scryfallSearchQuery = '';
      this.searchResults = [];
    } else {
      this.message = 'All images have been classified.';
    }
  }

  getCurrentImageUrl(): string {
    return `${environment.socketUrl}/image/${this.currentImage}`;
  }
}
