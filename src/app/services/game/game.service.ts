import { Injectable } from '@angular/core';
import { IRoom, PasswordCheckResponse } from '../../interfaces/room';
import { IPlayer } from '../../interfaces/player';
import { GameType } from '../../interfaces/game';
import { MTGCommander } from '../../classes/game/MTGCommander';
import { MTGStandard } from '../../classes/game/MTGStandard';
import { MTGModern } from '../../classes/game/MTGModern';
import { Game } from '../../classes/game/game';
import { MTGLegacy } from '../../classes/game/MTGLegacy';
import { MTGVintage } from '../../classes/game/MTGVintage';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public room!: IRoom;
  
  constructor(private http: HttpClient) { }

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
      case GameType.MTGLegacy:
        return new MTGLegacy();
        break;
      case GameType.MTGVintage:
        return new MTGVintage();
        break;
    }

    return new MTGCommander();
  }
  
  public checkPasswordProtection(roomId: string): Observable<PasswordCheckResponse>{
    return this.http.post<PasswordCheckResponse>(environment.socketUrl + '/password-check', { roomId: roomId })
  }
}
