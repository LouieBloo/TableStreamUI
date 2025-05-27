import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IRoom } from '../interfaces/IRoom';
import { GameType } from '../interfaces/IGame';

@Injectable({
  providedIn: 'root'
})
export class RoomListService {

  private roomsSubject = new BehaviorSubject<IRoom[] | null>(null);
  public rooms$ = this.roomsSubject.asObservable();

  constructor() {
    this.getRooms();
  }

  getRooms(){
    this.roomsSubject.next([{
      id: "1",
      name: 'Cool Room',
      reactionsEnabled: true,
      passwordProtected: true,
      gameType: GameType.MTGCommander,
      maxPlayers: 4,
      players: [],
      messages: []
    },{
      id: "2",
      name: 'Bingo',
      reactionsEnabled: true,
      passwordProtected: true,
      gameType: GameType.YugiohDomain,
      maxPlayers: 2,
      players: [],
      messages: []
    },{
      id: "3",
      name: 'Whats up gamers!',
      reactionsEnabled: false,
      passwordProtected: true,
      gameType: GameType.YugiohDomain,
      maxPlayers: 2,
      players: [],
      messages: []
    },{
      id: "4",
      name: 'Longer room name here wow!',
      reactionsEnabled: false,
      passwordProtected: false,
      gameType: GameType.PokemonStandard,
      maxPlayers: 2,
      players: [],
      messages: []
    },{
      id: "5",
      name: 'Cool Room43',
      reactionsEnabled: true,
      passwordProtected: false,
      gameType: GameType.MTGCommander,
      maxPlayers: 6,
      players: [],
      messages: []
    },{
      id: "6",
      name: 'Commander bracket 4',
      reactionsEnabled: true,
      passwordProtected: false,
      gameType: GameType.MTGLegacy,
      maxPlayers: 2,
      players: [],
      messages: []
    }]);
  }
}
