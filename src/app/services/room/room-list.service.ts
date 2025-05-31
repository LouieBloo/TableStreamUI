import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { IRoom } from '../../interfaces/IRoom';
import { GameType } from '../../interfaces/IGame';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomListService {

  private roomsSubject = new BehaviorSubject<IRoom[] | null>(null);
  public rooms$ = this.roomsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getRooms();
  }

  getRooms() {
    
    this.http.get<any>(environment.socketUrl + '/rooms').pipe(
      tap(res => {
        this.roomsSubject.next(res.rooms);
      })
    ).subscribe();




    // this.roomsSubject.next([{
    //   id: "1",
    //   name: 'Cool Room',
    //   reactionsEnabled: true,
    //   passwordProtected: true,
    //   gameType: GameType.MTGCommander,
    //   currentPlayers:2,
    //   maxPlayers: 4,
    //   players: [],
    //   messages: []
    // },{
    //   id: "2",
    //   name: 'Bingo',
    //   reactionsEnabled: true,
    //   passwordProtected: true,
    //   gameType: GameType.YugiohDomain,
    //   maxPlayers: 2,
    //   currentPlayers:1,
    //   players: [],
    //   messages: []
    // },{
    //   id: "3",
    //   name: 'Whats up gamers!',
    //   reactionsEnabled: false,
    //   passwordProtected: true,
    //   gameType: GameType.YugiohDomain,
    //   maxPlayers: 2,
    //   currentPlayers:1,
    //   players: [],
    //   messages: []
    // },{
    //   id: "4",
    //   name: 'Longer room name here wow!',
    //   reactionsEnabled: false,
    //   passwordProtected: false,
    //   gameType: GameType.PokemonStandard,
    //   maxPlayers: 2,
    //   currentPlayers:1,
    //   players: [],
    //   messages: []
    // },{
    //   id: "5",
    //   name: 'Cool Room43',
    //   reactionsEnabled: true,
    //   passwordProtected: false,
    //   gameType: GameType.MTGCommander,
    //   maxPlayers: 6,
    //   currentPlayers:4,
    //   players: [],
    //   messages: []
    // },{
    //   id: "6",
    //   name: 'Commander bracket 4',
    //   reactionsEnabled: true,
    //   passwordProtected: false,
    //   gameType: GameType.MTGLegacy,
    //   maxPlayers: 2,
    //   currentPlayers:1,
    //   players: [],
    //   messages: []
    // }]);
  }
}
