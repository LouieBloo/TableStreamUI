import { Component } from '@angular/core';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { UserStreamComponent } from '../users/user-stream/user-stream.component';
import { NgFor } from '@angular/common';
import {IPlayer} from '../../interfaces/user';
import {IRoom} from '../../interfaces/room';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ NgFor, UserStreamComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  // players: IPlayer[] = []
  localPlayerId: string = ""

  room!: IRoom;
  sortedPlayers: IPlayer[] = [];

  constructor(private webRTC: WebRTCService) { }

  ngOnInit() {
    this.room = {
      name: "temp",
      players: []
    }

    this.webRTC.subscribeToStreamAdd(this.streamAdded);
    this.webRTC.subscribeToStreamRemove(this.streamRemoved);

    this.webRTC.joinRoom((me:IPlayer, roomName: string)=>{
      this.room.name = roomName;
      this.localPlayerId = me.id;
      this.addPlayer(me);
    });
  }

  streamAdded = (id: string, stream: MediaStream, player:IPlayer) => {
    console.log("Add player: ", player);
    this.addPlayer(player);
    // this.remoteSocketIds.push(id);
  }

  streamRemoved = (id: string) => {
    // this.remoteSocketIds = this.remoteSocketIds.filter((userId) => userId !== id)
  }

  addPlayer = (newPlayer: IPlayer)=>{
    let foundPlayer = this.getPlayer(newPlayer.id)

    if(!foundPlayer){
      this.room.players.push(newPlayer);
    }else{
      //update the socketId
      foundPlayer.socketId = newPlayer.socketId;
    }

    console.log(newPlayer)

    this.sortPlayers();

    return foundPlayer;
  }

  getPlayer = (id: string)=>{
    return this.room.players.find(p => p.id === id);
  }

  sortPlayers = ()=>{
    if (this.room && this.room.players) {
      this.sortedPlayers = this.room.players.sort((a, b) => a.turnOrder - b.turnOrder);
    }
  }
}
