import { Component } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgFor } from '@angular/common';
import { GameService } from '../../../services/game/game.service';
import { IPlayer } from '../../../interfaces/IPlayer';
import { GameEvent } from '../../../interfaces/IGame';

@Component({
  selector: 'app-player-turn-order-modal',
  standalone: true,
  imports: [NgFor],
  templateUrl: './player-turn-order-modal.component.html',
  styleUrl: './player-turn-order-modal.component.css'
})
export class PlayerTurnOrderModalComponent {

  //copy of what is actually in gameService so we can modify player order without affecting gameService
  temporaryPlayers:IPlayer[] = [];

  constructor(private webRTC:WebRTCService, public gameService:GameService){
  }


  open() {
    const dialogCheckbox = document.getElementById('playerTurnOrderToggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }

    this.temporaryPlayers = JSON.parse(JSON.stringify(this.gameService.players));
  }

  close(){
    const closeModalButton = document.getElementById('closePlayerTurnOrderModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  save = ()=>{
    this.webRTC.sendGameEvent({
      event: GameEvent.SetPlayerTurnOrders,
      payload: this.temporaryPlayers.map((trimmedPlayer: IPlayer)=>{
        return {
          id: trimmedPlayer.id,
          turnOrder: trimmedPlayer.turnOrder
        }
      })
    })

    this.close();
  }

  randomizeTurnOrder = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.RandomizePlayerOrder });
    this.close();
  }

  get getTemporaryPlayers() {
    return this.temporaryPlayers.sort((a: IPlayer, b: IPlayer) => a.turnOrder - b.turnOrder);
  }

  movePlayerUp = (player: IPlayer) => {
    const currentOrder = player.turnOrder;
    if (currentOrder > 0) {
      // Find the player currently in the new desired position
      const swapPlayer = this.temporaryPlayers.find(
        (p) => p.turnOrder === currentOrder - 1
      );
      if (swapPlayer) {
        // Swap their turnOrder values
        swapPlayer.turnOrder = currentOrder;
        player.turnOrder = currentOrder - 1;
      }
    }
  }
  
  movePlayerDown = (player: IPlayer) => {
    const currentOrder = player.turnOrder;
    const maxOrder = this.temporaryPlayers.length - 1;
    if (currentOrder < maxOrder) {
      // Find the player currently in the new desired position
      const swapPlayer = this.temporaryPlayers.find(
        (p) => p.turnOrder === currentOrder + 1
      );
      if (swapPlayer) {
        // Swap their turnOrder values
        swapPlayer.turnOrder = currentOrder;
        player.turnOrder = currentOrder + 1;
      }
    }
  }
}
