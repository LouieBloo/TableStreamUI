import { Injectable } from '@angular/core';
import { IKickPlayerResponse, IRoom, PasswordCheckResponse } from '../../interfaces/IRoom';
import { IPlayer } from '../../interfaces/IPlayer';
import { GameType, IGameEvent } from '../../interfaces/IGame';
import { MTGCommander } from '../../classes/game/MTGCommander';
import { MTGStandard } from '../../classes/game/MTGStandard';
import { MTGModern } from '../../classes/game/MTGModern';
import { Game } from '../../classes/game/game';
import { MTGLegacy } from '../../classes/game/MTGLegacy';
import { MTGVintage } from '../../classes/game/MTGVintage';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PokemonStandard } from '../../classes/game/PokemonStandard';
import { MTGPauperCommander } from '../../classes/game/MTGPauperCommander';
import { YugiohStandard } from '../../classes/game/YugiohStandard';
import { YugiohDomain } from '../../classes/game/YugiohStandardDomain';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public room!: IRoom;
  _localPlayer$ = new BehaviorSubject<IPlayer|null|undefined>(null);

  get localPlayer$() {
    return this._localPlayer$.asObservable();
  }

  constructor(private http: HttpClient) {
  }

  public setRoom(room:IRoom, localPlayerId: string){
    if(room.game?.gameType){
      let newGame = GameService.createGame(room.game?.gameType);
      room.game = Object.assign(newGame,room.game);
    }

    this.room = room;
    debugger;
    this.setLocalPlayer(localPlayerId);
  }

  public setLocalPlayer(localPlayerId: string) {
    const localPlayer = this.getPlayerById(localPlayerId);
    debugger;
    this._localPlayer$.next(localPlayer);
  }

  public getPlayerById = (playerId:string | null):IPlayer | undefined=>{
    if(this.room && this.room.players){
      return this.room.players.find(p=> p.id == playerId);
    }

    return undefined;
  }

  public removePlayer(playerId: string){
    this.room.players = this.room.players.filter(p => p.id != playerId);
    this.sortPlayers();
  }

  sortPlayers(): void {
    if (this.room && this.room.players) {
      this.room.players.sort((a, b) => a.turnOrder - b.turnOrder);
    }
  }

  public getPlayerTakingTurnIndex = (): number => {
    return this.room?.players?.findIndex(p => p.isTakingTurn) ?? 0;
  };

  public isCommanderGame = ():boolean =>{
    return this.room.game?.gameType == GameType.MTGCommander || this.room.game?.gameType == GameType.MTGPauperCommander;
  }

  public isDomainGame = ():boolean =>{
    return this.room.game?.gameType == GameType.YugiohDomain;
  }

  public isYugiohGame = (): boolean => {
    if(!this.room.game?.gameType)
      return false
    
    if(this.room.game.gameType === GameType.YugiohStandard || this.room.game.gameType === GameType.YugiohDomain)
      return true

    return false
  }

  public isMagicGame = (): boolean => {
    if(!this.room.game?.gameType){return false;}
    const magicGameTypes = [
        GameType.MTGStandard,
        GameType.MTGCommander,
        GameType.MTGLegacy,
        GameType.MTGVintage,
        GameType.MTGModern,
        GameType.MTGPauperCommander
    ];
    return magicGameTypes.includes(this.room.game?.gameType);
}

  public isPokemonGame = ():boolean =>{
    return this.room.game?.gameType == GameType.PokemonStandard;
  }

  get pokemonGame():PokemonStandard{
    return this.room.game as PokemonStandard;
  }

  // most games will not have day/night so we "assume" its night which is default css coloring (Dark)
  get isDay() : boolean{
    return this.room.game?.dayNightCycle && this.room.game?.dayNightCycle == 'DAY' ? true : false;
  }

  static createGame(gameType: GameType) : Game {
    switch (gameType) {
      case GameType.MTGCommander:
        return new MTGCommander();
      case GameType.MTGStandard:
        return new MTGStandard();
      case GameType.MTGModern:
        return new MTGModern();
      case GameType.MTGLegacy:
        return new MTGLegacy();
      case GameType.MTGVintage:
        return new MTGVintage();
      case GameType.PokemonStandard:
        return new PokemonStandard();
      case GameType.MTGPauperCommander:
        return new MTGPauperCommander();
      case GameType.YugiohStandard:
        return new YugiohStandard();
      case GameType.YugiohDomain:
        return new YugiohDomain();
    }

    return new MTGCommander();
  }
  
  public checkPasswordProtection(roomId: string): Observable<PasswordCheckResponse>{
    return this.http.post<PasswordCheckResponse>(environment.socketUrl + '/password-check', { roomId: roomId })
  }
}
