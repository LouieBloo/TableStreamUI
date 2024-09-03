import { Component, Input } from '@angular/core';
import { IPlayer } from '../../../interfaces/player';
import { ModalServiceService, ModalType } from '../../../services/modal/modal-service.service';
import { ScryfallCard } from '../../../interfaces/scryfall';
import { NgIf } from '@angular/common';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent } from '../../../interfaces/game';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapPencilSquare } from '@ng-icons/bootstrap-icons';
import { CardComponent } from '../../card/card.component';

@Component({
  selector: 'app-set-commander',
  standalone: true,
  imports: [NgIf,NgIconComponent, CardComponent],
  templateUrl: './set-commander.component.html',
  styleUrl: './set-commander.component.css',
  viewProviders: [provideIcons({ bootstrapPencilSquare })]
})
export class SetCommanderComponent {

  @Input() player!: IPlayer;
  @Input() editable!: boolean;
  
  popoverPosition: { top: number, left: number } = { top: 0, left: 0 };

  constructor(private modalService: ModalServiceService, private webRtc:WebRTCService){

  }

  openSearch = ()=>{
    this.modalService.openModal(ModalType.SearchCards,this.cardSelected);
  }

  cardSelected = (card:ScryfallCard)=>{
    if(card != null){
      this.webRtc.sendGameEvent({event: GameEvent.SetCommander,payload: card});
    }
  }

  imageUrl = ()=>{
    if(!this.player.commander){return "";}

    if(this.player.commander.image_uris?.normal){
      return this.player.commander.image_uris?.normal;
    }

    if(this.player.commander.card_faces){
      if(this.player.commander.card_faces.length > 1){
        return this.player.commander.card_faces[0].image_uris?.normal;
      }else{
        return this.player.commander.card_faces[0].image_uris?.normal;
      }
    }

    return ""
  }

  onMouseOver(event: MouseEvent) {
    this.popoverPosition = this.getPopoverPosition(event);
  }

  getPopoverPosition(event: MouseEvent): { top: number, left: number } {
    const popoverWidth = 319;
    const popoverHeight = 450;
  
    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
  
    // Calculate the initial top and left positions based on the mouse cursor
    let top = event.clientY;
    let left = event.clientX;
  
    // Adjust the position if the popover would go off the right edge of the screen
    if (left + popoverWidth > viewportWidth) {
      left = viewportWidth - popoverWidth - 10; // 10px padding from the right edge
    }
  
    // Adjust the position if the popover would go off the bottom edge of the screen
    if (top + popoverHeight > viewportHeight) {
      top = viewportHeight - popoverHeight - 10; // 10px padding from the bottom edge
    }
  
    // Ensure the popover doesn't go off the top edge of the screen
    if (top < 10) {
      top = 10; // 10px padding from the top edge
    }
  
    // Ensure the popover doesn't go off the left edge of the screen
    if (left < 10) {
      left = 10; // 10px padding from the left edge
    }
  
    return { top, left };
  }
  
}
