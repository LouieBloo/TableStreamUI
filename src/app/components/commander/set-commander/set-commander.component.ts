import { Component, Input } from '@angular/core';
import { ModalServiceService, ModalType } from '../../../services/modal/modal-service.service';
import { PlayingCard } from '../../../interfaces/scryfall';
import { NgFor, NgIf } from '@angular/common';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent } from '../../../interfaces/game';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapPencilSquare } from '@ng-icons/bootstrap-icons';
import { CardComponent } from '../../card/card.component';

@Component({
  selector: 'app-set-commander',
  standalone: true,
  imports: [NgIf,NgIconComponent, CardComponent, NgFor],
  templateUrl: './set-commander.component.html',
  styleUrl: './set-commander.component.css',
  viewProviders: [provideIcons({ bootstrapPencilSquare })]
})
export class SetCommanderComponent {

  @Input() commanders!: PlayingCard[];
  @Input() editable!: boolean;
  
  selectedCommander: PlayingCard|null = null;
  popoverPosition: { top: number, left: number } = { top: 0, left: 0 };
  constructor(private modalService: ModalServiceService, private webRtc:WebRTCService){}


  imageSrc(commander: PlayingCard) {
  
    if (commander?.image_uris?.normal)
      return commander.image_uris.normal;
  
    if (commander?.card_faces)
      return commander.card_faces[0].image_uris?.normal;
  
    return "";
  }

  test(){
    console.log(this.commanders);
    debugger;
  }
  
  openSearch = (commander: PlayingCard|null) => {
    if (!this.editable)
      return;

    this.selectedCommander = commander;
    this.modalService.openModal(ModalType.SearchCards, this.cardSelected);
  };
  
  cardSelected = (newCommander: PlayingCard) => {
    if (newCommander != null)
      this.webRtc.sendGameEvent({ event: GameEvent.SetCommander, payload: {newCommander: newCommander, oldCommander: this.selectedCommander} });
  };


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
