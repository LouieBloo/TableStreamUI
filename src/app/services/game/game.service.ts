import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Game } from '../../classes/game/game';
import { MTGCommander } from '../../classes/game/MTGCommander';
import { MTGLegacy } from '../../classes/game/MTGLegacy';
import { MTGModern } from '../../classes/game/MTGModern';
import { MTGPauperCommander } from '../../classes/game/MTGPauperCommander';
import { MTGStandard } from '../../classes/game/MTGStandard';
import { MTGVintage } from '../../classes/game/MTGVintage';
import { PokemonStandard } from '../../classes/game/PokemonStandard';
import { YugiohStandard } from '../../classes/game/YugiohStandard';
import { YugiohDomain } from '../../classes/game/YugiohStandardDomain';
import { GameEvent, GameType, IGameEvent } from '../../interfaces/IGame';
import { IPlayer, ISpectator } from '../../interfaces/IPlayer';
import { IRoom, IRoomHistoryEvent, PasswordCheckResponse } from '../../interfaces/IRoom';
import { OncePiece } from '../../classes/game/OnePiece';
import { Token } from '../../interfaces/IPlayingCard';
import { IKickPlayerResponse } from '../../interfaces/IRoom'
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  http = inject(HttpClient);
  logger = inject(LoggerService);

  private room!: IRoom;
  _localPlayer$ = new BehaviorSubject<IPlayer|null|undefined>(null);
  _spectator = new BehaviorSubject<ISpectator|null|undefined>(null);
  kickedPlayerEvent = new BehaviorSubject<IGameEvent|null>(null);
  private gameEventSubject = new Subject<IGameEvent>();
  public gameEvent = this.gameEventSubject.asObservable();

  get kickedPlayerEvent$(){
    return this.kickedPlayerEvent.asObservable();
  }

  get startedAt(): Date|undefined{
    return this.room?.game?.startedAt
  }

  get numberOfPlayersInRoom(): number {
    return this.room?.players?.length ?? 0;
  }

  get roomId(): string|undefined {
    return this.room?.id;
  }

  get adjustedRoomName(){
    return this.room?.name?.length > 20 ? this.room?.name.slice(0,19) + ".." : this.room?.name;
  }

  get localPlayer$() {
    return this._localPlayer$.asObservable();
  }

  get spectator$() {
    return this._spectator.asObservable();
  }

  get gameTokens(): Token[]|undefined{
    return this.room?.game?.tokens;
  }

  get isActiveGame(): boolean|undefined{
    return this.room?.game?.active;
  }

  get isClassifierActive(): boolean|undefined {
   return this.room?.game?.classifierActive;
  }

  get dayNightCycle(): string|undefined {
    return this.room?.game?.dayNightCycle;
  }

  get isAllowPlayerKicked(): boolean|undefined {
    return this.room?.allowPlayerKicking;
  }

  get commanderTitle(): string|undefined{
    return this.room?.game?.commanderTitle;
  }

  get isTranscribeActive(): boolean|undefined {
    return this.room?.game?.transcribeActive;
  }

  get areReactionsEnabled(): boolean|undefined {
    return this.room?.reactionsEnabled;
  }

  get players(): IPlayer[] {
    return this.room?.players
  }

  get game(): Game|undefined{
    return this.room?.game
  }

  get gameName(): string|undefined{
    return this.room?.game?.name
  }

  get searchTag(): string|undefined {
    return this.room?.game?.searchTag
  }

  get doesRoomHaveHistory(): boolean {
    return !!this.room?.history && this.room.history.length > 0;
  }

  get roomHistory(): IRoomHistoryEvent[] | undefined{
    return this.room?.history
  }

  get coinImagePathPrexis(): string|undefined{
    return this.room?.game?.coinImagePathPrefix
  }

  get isDay(): boolean {
    return this.room?.game?.dayNightCycle === 'DAY';
  }

  handleHistory(historyEvent: IRoomHistoryEvent){
    console.log('HISTORY: ', historyEvent);
    if (
      this.room &&
      this.room.history &&
      historyEvent
    ) {
      this.room.history.push(historyEvent);
    }
  }

  public getPlayerTurnOrder(index: number){
    return this.room.players[index].turnOrder;
  }

  public setRoom(room:IRoom, localPlayerId: string){
    if(room.game?.gameType){
      let newGame = GameService.createGame(room.game?.gameType);
      room.game = Object.assign(newGame,room.game);
    }

    this.room = room;
    this.setLocalPlayer(localPlayerId);
  }

  public setLocalPlayer(localPlayerId: string) {
    const localPlayer = this.getPlayerById(localPlayerId);

    if(localPlayer){
      this._localPlayer$.next(localPlayer);
      return;
    }

    const spectator = this.getSpectatorById(localPlayerId);
    if(spectator){
      this._spectator.next(spectator);
      return;
    }
  }

  public isLocalPlayer(playerId: string){
    return this._localPlayer$.value?.id == playerId;
  }

  public getPlayerById = (playerId:string | null):IPlayer | undefined=>{
    if(this.room && this.room.players){
      return this.room.players.find(p=> p.id == playerId);
    }

    return undefined;
  }

  public getSpectatorById = (spectatorId: string|null): ISpectator | undefined => {
    if(this.room && this.room.players){
      return this.room.spectators?.find(spectator => spectator.id == spectatorId)
    }
    return undefined;
  }

  public removePlayer(playerId: string){
    this.room.players = this.room.players.filter(p => p.id != playerId);
    this.sortPlayers();
  }

  public removeTokens(tokens: Token[]){
    tokens.forEach((token: Token) => {
      this.room.game?.removeToken(token);;
    });
  }

  public createToken(token: Token){
    if(this.room.game){
      this.room.game.createToken(token);
    }
  }

  public removeKickedPlayer(response: IKickPlayerResponse){
    this.removeTokens(response.removedTokens);
    this.removePlayer(response.kickedPlayer?.id);
  }

  updatePlayers(newPlayers: IPlayer[]): void {
    if (!newPlayers) {
      return;
    }

    newPlayers.forEach((newPlayer) => {
      const existingPlayer = this.room.players.find(
        (p) => p.id === newPlayer.id
      );
      if (existingPlayer) {
        Object.assign(existingPlayer, newPlayer); // This updates only the fields that have changed
      }
    });
  }

  applyGameUpdate(gameData: any, resetDayNight?: boolean){
     if (!this.room.game) return;
    this.room.game.startedAt = gameData.startedAt;
    this.room.game.active = gameData.active;
    if (resetDayNight) this.room.game.dayNightCycle = gameData.dayNightCycle;
  }

  sortPlayers(): void {
    if (this.room && this.room.players) {
      this.room.players.sort((a, b) => a.turnOrder - b.turnOrder);
    }
  }

  addPlayer(newPlayer: IPlayer) {
    let foundPlayer = this.getPlayerById(newPlayer.id);

    if (!foundPlayer) {
      this.room.players.push(newPlayer);
    } else {
      foundPlayer.socketId = newPlayer.socketId;
    }
    this.sortPlayers();

    return foundPlayer;
  };

  public setTempRoom(){
    this.room = {
      name: 'temp',
      players: [],
      messages: [],
    };
  }

  public updateDayNightCycle(game: Game){
        this.room.game?.updateDayNightCycle(game);
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

  public isOnePieceGame = ():boolean =>{
    return this.room.game?.gameType == GameType.OnePiece;
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
      case GameType.OnePiece:
        return new OncePiece();
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

  handleGameEvent = (event: IGameEvent) => {
    this.logger.log('handling event: ', event);
    switch (event.event) {
      case GameEvent.RandomizePlayerOrder:
      case GameEvent.SetPlayerTurnOrders:
        this.updatePlayers(event.response.players);
        this.sortPlayers();
        break;
      case GameEvent.ModifyGameProperty:
        this.updateDayNightCycle(event.response);
        break;
      case GameEvent.StartGame:
        this.updatePlayers(event.response.players);
        this.applyGameUpdate(event.response.data);
        break;
      case GameEvent.ResetGame:
        this.updatePlayers(event.response.players);
        this.applyGameUpdate(event.response.data, true);
        break;
      case GameEvent.EndCurrentTurn:
      case GameEvent.ToggleMonarch:
      case GameEvent.ToggleInitiative:
      case GameEvent.SetCommander:
      case GameEvent.ModifyPlayerProperty:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ModifyPlayerCommanderDamage:
        this.updatePlayers([event.response]);//why is this different
        break;
      case GameEvent.CreateToken:
        this.createToken(event.response);
        break;
      case GameEvent.DeleteToken:
        this.removeTokens([event.response]);
        break;
      case GameEvent.KickPlayer:
        const kickedResponse: IKickPlayerResponse = event.response;
        this.removeKickedPlayer(event.response);
        this.updatePlayers(kickedResponse.players);
        this.kickedPlayerEvent.next(event);
        break;
    }
    this.gameEventSubject.next(event);
  };
}
