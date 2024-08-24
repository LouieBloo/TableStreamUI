import { Component } from '@angular/core';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { UserStreamComponent } from '../users/user-stream/user-stream.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { IPlayer } from '../../interfaces/player';
import { IRoom } from '../../interfaces/room';
import { MessengerComponent } from '../messaging/messenger/messenger.component';
import { GameEvent, IGameEvent } from '../../interfaces/game';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { ScryfallService } from '../../services/scryfall/scryfall.service';
import { CardListComponent } from '../card-list/card-list.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NgFor, UserStreamComponent, MessengerComponent, NgIf, NgClass, CardListComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  // players: IPlayer[] = []
  localPlayerId: string = ""
  localPlayer!: IPlayer;

  room!: IRoom;
  sortedPlayers: IPlayer[] = [];

  constructor(private webRTC: WebRTCService, private inputService: InputService) {
    inputService.subscribe((userAction: UserInputAction) => {
      if (userAction == UserInputAction.PassTurn) {
        this.webRTC.sendGameEvent({ event: GameEvent.EndCurrentTurn })
      }
    })
  }

  ngOnInit() {
    this.room = {
      name: "temp",
      players: []
    }

    this.webRTC.subscribeToStreamAdd(this.streamAdded);
    this.webRTC.subscribeToStreamRemove(this.streamRemoved);
    this.webRTC.subscribeToGameEvents(this.handleGameEvent);

    this.webRTC.joinRoom(localStorage.getItem('playerName'), localStorage.getItem('roomName'), (me: IPlayer, roomName: string) => {
      this.room.name = roomName;
      this.localPlayerId = me.id;
      this.localPlayer = me;
      this.addPlayer(me);
    });
  }

  streamAdded = (id: string, stream: MediaStream, player: IPlayer) => {
    console.log("Add player: ", player);
    this.addPlayer(player);
    // this.remoteSocketIds.push(id);
  }

  streamRemoved = (id: string) => {
    // this.remoteSocketIds = this.remoteSocketIds.filter((userId) => userId !== id)
  }

  handleGameEvent = (event: IGameEvent) => {
    console.log("handling event: ", event);
    switch (event.event) {
      case GameEvent.RandomizePlayerOrder:
        this.updatePlayers(event.response);
        this.sortPlayers();
        break;
      case GameEvent.ModifyLifeTotal:
        this.updatePlayers([event.response]);
        break;
      case GameEvent.StartGame:
        this.updatePlayers(event.response);
        break;
      case GameEvent.EndCurrentTurn:
        this.updatePlayers(event.response);
        break;
      case GameEvent.TakeMonarch:
          this.updatePlayers(event.response);
          break;
    }
  }

  addPlayer = (newPlayer: IPlayer) => {
    let foundPlayer = this.getPlayer(newPlayer.id)

    if (!foundPlayer) {
      this.room.players.push(newPlayer);
    } else {
      //update the socketId
      foundPlayer.socketId = newPlayer.socketId;
    }

    this.sortPlayers();

    return foundPlayer;
  }

  updatePlayers(newPlayers: IPlayer[]): void {
    if (!newPlayers) { return; }

    newPlayers.forEach(newPlayer => {
      const existingPlayer = this.room.players.find(p => p.id === newPlayer.id);
      if (existingPlayer) {
        Object.assign(existingPlayer, newPlayer); // This updates only the fields that have changed
      }
    });
  }

  getPlayer = (id: string) => {
    return this.room.players.find(p => p.id === id);
  }

  sortPlayers = () => {
    if (this.room && this.room.players) {
      this.sortedPlayers = this.room.players.sort((a, b) => a.turnOrder - b.turnOrder);
    }
  }

  startGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.StartGame });
  }

  randomizeTurnOrder = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.RandomizePlayerOrder });
  }

  
}
