import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PropertyCounterComponent } from '../../property-counter/property-counter.component';
import { GameService } from '../../../services/game/game.service';
import { IPlayer } from '../../../interfaces/IPlayer';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapChevronDoubleRight, bootstrapChevronDoubleLeft } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-commander-side-bar',
  standalone: true,
  imports: [NgIf,NgClass,PropertyCounterComponent,CommonModule,NgIcon],
  templateUrl: './commander-side-bar.component.html',
  styleUrl: './commander-side-bar.component.css',
  viewProviders: [provideIcons({ bootstrapChevronDoubleRight, bootstrapChevronDoubleLeft })]
})
export class CommanderSideBarComponent {
  @Input() player!: IPlayer;
  @Input() localStream: boolean = false;
  @Input() getModifyCommanderDamageCallback:any;

  showSidebar:boolean = true;
  panelHidden:boolean = false;
  
  constructor(public gameService: GameService) {}

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  
    // if showing, immediately unhide the wrapper
    if (this.showSidebar) {
      this.panelHidden = false;
    }
  }
  
  onTransitionEnd() {
    // hide wrapper only if we're hiding the sidebar
    if (!this.showSidebar) {
      this.panelHidden = true;
    }
  }

  getKeys(object: any): string[] {
    return Object.keys(object);
  }

  get hasAnyCommanderAssigned(): boolean {
    const commanderDamages = this.player.commanderDamages;
  
    // Loop through each playerId (the opponent who dealt damage)
    for (const opponentId of Object.keys(commanderDamages)) {
      const cards = commanderDamages[opponentId];
  
      // Check if any commander entry has a valid card
      for (const cardId of Object.keys(cards)) {
        const entry = cards[cardId];
        if (entry?.card) {
          return true;
        }
      }
    }
  
    return false;
  }
}
