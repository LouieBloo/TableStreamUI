import { Component, Input } from '@angular/core';
import { ScryfallCard } from '../../interfaces/scryfall';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!:ScryfallCard | null;

  @Input() showPopup:boolean = true;

  flipped:boolean = false;
  loadingCard:boolean = true;

  imageUrl = ()=>{
    if(!this.card){return "";}

    if(this.card.image_uris?.normal){
      return this.card.image_uris?.normal;
    }

    if(this.card.card_faces){
      if(this.card.card_faces.length > 1){
        return this.card.card_faces[this.flipped ? 1 : 0].image_uris?.normal;
      }else{
        return this.card.card_faces[0].image_uris?.normal;
      }
    }

    return ""
  }

  flipImage = ()=>{
    this.flipped = !this.flipped;
  }

  onImageLoad(): void {
    console.log("loaded...");
    this.loadingCard = false;
  }
}
