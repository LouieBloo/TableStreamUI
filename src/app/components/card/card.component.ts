import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayingCard } from '../../interfaces/IScryfall';
import { DecimalPipe, NgClass, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, NgClass, DecimalPipe, NgStyle],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!:PlayingCard | null;
  @Input() showPopup:boolean = true;
  @Input() maximumRightMargin:number = 0;
  @Input() hoverMinDistance:number = 50;

  @Output() deleteClicked = new EventEmitter<void>();

  popupStyle: any = {};

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

  onMouseEnter(event: MouseEvent) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position with constraints
    const popupWidth = 427; 
    const popupHeight = 600;
    const xOffset = this.hoverMinDistance; 

    let left = mouseX + xOffset;
    if (left + popupWidth > viewportWidth) {
      left = mouseX - popupWidth - xOffset;
    }

    // Ensure left is not within maximumRightMargin px of the right side if the number is set
    if (this.maximumRightMargin > 0 && (left + popupWidth) > (viewportWidth - this.maximumRightMargin)) {
      left = viewportWidth - popupWidth - this.maximumRightMargin;
    }

    let top = (mouseY - (popupHeight/2));//pretend the click is a bit lower than it is so the card is right in the middle
    //cursor is at bottom of screen
    if ((top + popupHeight) >= viewportHeight) {
      top = viewportHeight - popupHeight;
    }
    if (top < 0) {
      top = 10;
    }

    this.popupStyle = {
      left: `${left}px`,
      top: `${top}px`,
    };
  }

  flipImage = ()=>{
    this.flipped = !this.flipped;
  }

  onImageLoad(): void {
    this.loadingCard = false;
  }

  onDeleteClicked() {
    this.deleteClicked.emit();
  }

  get hasDeleteHandler(): boolean {
    return this.deleteClicked.observed;
  }
}
