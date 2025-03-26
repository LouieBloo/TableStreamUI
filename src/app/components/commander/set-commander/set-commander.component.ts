import { Component, input, Input } from '@angular/core';
import { IPlayer, PlayerProperties } from '../../../interfaces/IPlayer';
import { ModalServiceService, ModalType } from '../../../services/modal/modal-service.service';
import { IPlayingCard } from '../../../interfaces/IPlayingCard';
import { NgIf } from '@angular/common';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent, IModifyPlayerProperty } from '../../../interfaces/IGame';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapPencilSquare, bootstrapTrash3 } from '@ng-icons/bootstrap-icons';
import { CardComponent } from '../../card/card.component';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-set-commander',
  standalone: true,
  imports: [NgIf,NgIconComponent, CardComponent, TooltipDirective],
  templateUrl: './set-commander.component.html',
  styleUrl: './set-commander.component.css',
  viewProviders: [provideIcons({ bootstrapPencilSquare, bootstrapTrash3 })]
})
export class SetCommanderComponent {

  @Input() player!: IPlayer;
  @Input() editable!: boolean;
  @Input() index!: number;
  @Input() commander!:IPlayingCard;
  
  popoverPosition: { top: number, left: number } = { top: 0, left: 0 };
  flipped:boolean = false;

  constructor(private modalService: ModalServiceService, private webRtc:WebRTCService){

  }

  openSearch = ()=>{
    if(!this.editable){return;}
    this.modalService.openModal(ModalType.SearchCards,this.cardSelected);
  }

  cardSelected = (card:IPlayingCard)=>{
    if(card != null){
      this.webRtc.sendGameEvent({event: GameEvent.SetCommander,payload: {card: card, index: this.index}});
    }
  }

  clearCommander = ()=>{
    this.webRtc.sendGameEvent({event: GameEvent.SetCommander,payload: {card: null, index: this.index}});
  }

  modifyCommanderCastAmount = (amount:number)=>{
    let payload: IModifyPlayerProperty = {
      property: PlayerProperties.commanderCastAmount,
      amountToModify: amount
    }
    this.webRtc.sendGameEvent({event: GameEvent.ModifyPlayerProperty, payload: {...payload, commander: this.commander}})
  }

  imageUrl = ()=>{
    if(!this.commander){return "";}

    if(this.commander.image_uris?.normal){
      return this.commander.image_uris?.normal;
    }

    if(this.commander.card_faces){
      if(this.commander.card_faces.length > 1){
        return this.commander.card_faces[this.flipped ? 1 : 0].image_uris?.normal;
      }

      return this.commander.card_faces[0].image_uris?.normal;
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
