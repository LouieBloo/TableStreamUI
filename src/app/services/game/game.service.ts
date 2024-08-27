import { Injectable } from '@angular/core';
import { IRoom } from '../../interfaces/room';
import { IPlayer } from '../../interfaces/player';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public room!: IRoom;
  
  constructor() { }

  public getPlayerById = (playerId:string):IPlayer | undefined=>{
    if(this.room && this.room.players){
      return this.room.players.find(p=> p.id == playerId);
    }

    return undefined;
  }
}
