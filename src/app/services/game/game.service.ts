import { Injectable } from '@angular/core';
import { IRoom } from '../../interfaces/room';
import { IPlayer } from '../../interfaces/player';
import { GameType } from '../../interfaces/game';
import { MTGCommander } from '../../classes/game/MTGCommander';
import { MTGStandard } from '../../classes/game/MTGStandard';
import { MTGModern } from '../../classes/game/MTGModern';
import { Game } from '../../classes/game/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public room!: IRoom;
  
  constructor() { }

  public setRoom(room:IRoom){
    if(room.game?.gameType){
      let newGame = GameService.createGame(room.game?.gameType);
      room.game = Object.assign(newGame,room.game);
    }

    this.room = room;
  }

  public getPlayerById = (playerId:string):IPlayer | undefined=>{
    if(this.room && this.room.players){
      return this.room.players.find(p=> p.id == playerId);
    }

    return undefined;
  }

  public isCommanderGame = ():boolean =>{
    return this.room.game?.gameType == GameType.MTGCommander;
  }

  // public getGameType = ():GameType | undefined=>{
  //   return this.room.game?.gameType;
  // }

  static createGame(gameType: GameType) : Game {
    switch (gameType) {
      case GameType.MTGCommander:
        return new MTGCommander();
        break;
      case GameType.MTGStandard:
        return new MTGStandard();
        break;
      case GameType.MTGModern:
        return new MTGModern();
        break;
    }

    return new MTGCommander();
  }
}
