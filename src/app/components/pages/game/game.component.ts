import { Component, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { UserStreamComponent } from '../../users/user-stream/user-stream.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { IPlayer, IUser, UserType } from '../../../interfaces/player';
import { IRoom } from '../../../interfaces/room';
import { MessengerComponent } from '../../messaging/messenger/messenger.component';
import { GameEvent, GameType, IGameEvent } from '../../../interfaces/game';
import { InputService } from '../../../services/input/input.service';
import { UserInputAction } from '../../../interfaces/inputs';
import { ScryfallService } from '../../../services/scryfall/scryfall.service';
import { CardListComponent } from '../../card-list/card-list.component';
import { GameService } from '../../../services/game/game.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportModalComponent } from '../../modals/report-modal/report-modal.component';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { PasswordModalComponent } from '../../modals/password-modal/password-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [NgFor, UserStreamComponent, MessengerComponent, NgIf, NgClass, CardListComponent, ReportModalComponent, PasswordModalComponent, TooltipDirective],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  localPlayerId: string = ""
  localPlayer!: IPlayer;

  sortedPlayers: IPlayer[] = [];
  roomId!: string;

  showingHotkeys:boolean = false;

  private inputSubscription!: Subscription;

  @ViewChild(ReportModalComponent) reportComponent!: ReportModalComponent;
  @ViewChild(PasswordModalComponent) passwordModal!: PasswordModalComponent;

  constructor(
    private webRTC: WebRTCService, 
    private inputService: InputService,
    public gameService:GameService,
    private router: Router, 
    private route: ActivatedRoute,
    private alertService: AlertsService,
    private http:HttpClient) {
      this.gameService.room = {
        name: "temp",
        players: [],
        messages: []
      }
  }


  ngOnInit() {
    this.roomId = this.route.snapshot.queryParamMap.get('id')!;
    let previousRoomId = localStorage.getItem('roomId');
    let hasSetSpectator = localStorage.getItem("isSpectator") == 'false' || localStorage.getItem("isSpectator") == 'true';
    
    if(!localStorage.getItem('hasPlayedBefore')){
      this.showingHotkeys = true;
      localStorage.setItem('hasPlayedBefore', 'true');
      setTimeout(()=>{this.showingHotkeys = false},1000 *60 * 5)
    }

    if(!localStorage.getItem('playerName') || !hasSetSpectator || (previousRoomId && this.roomId != previousRoomId)){
      if(this.roomId){
        this.router.navigate(['/join'], {
          queryParams: { id: this.roomId}, 
          queryParamsHandling: 'merge',
        });
      }else{
        this.router.navigate(['/join']);
      }

      return;
    }

    this.inputSubscription = this.inputService.subscribe((userAction: UserInputAction) => {
      if (userAction == UserInputAction.PassTurn) {
        this.webRTC.sendGameEvent({ event: GameEvent.EndCurrentTurn })
      }
    })

    

    this.webRTC.subscribeToStreamAdd(this.streamAdded);
    this.webRTC.subscribeToStreamRemove(this.streamRemoved);
    this.webRTC.subscribeToGameEvents(this.handleGameEvent);

    this.checkPasswordProtection(this.roomId);

    
  }

  checkPasswordProtection = async(roomId:string)=>{
    if(localStorage.getItem("password")){
      this.loadIntoGame(localStorage.getItem("password"));
      return;
    }

    this.http.post(environment.socketUrl + '/password-check',{roomId: roomId}).subscribe(
      (response:any) => {
        if(response.result == true){
          this.passwordModal.open(this.loadIntoGame)
        }else{
          this.loadIntoGame(null);
        }
      },
      (error) => {
        console.error('Error joining game:', error);
        alert('Error joining game:' + error);
      }
    );
  }

  loadIntoGame = (password:string | null)=>{
    localStorage.setItem("password",password + "");

    const amISpectator = localStorage.getItem("isSpectator") && localStorage.getItem("isSpectator") == 'true';
    const gameType = localStorage.getItem("gameType");

    this.webRTC.joinRoom(localStorage.getItem('playerName'), this.roomId, password, gameType, localStorage.getItem('roomName'), amISpectator ? UserType.Spectator : UserType.Player, (me: IUser, roomName: string, room:IRoom) => {
      this.gameService.setRoom(room);
      console.log(room);
      this.localPlayerId = me.id;

      localStorage.setItem('roomId',room.id + "")
      localStorage.setItem("playerId", me.id);

      this.router.navigate([], {
        queryParams: { id: room.id}, 
        queryParamsHandling: 'merge', // This merges with any existing query params
        replaceUrl: true // Replace the current URL in history
      });

      if(me.type == UserType.Player){
        this.localPlayer = me as IPlayer;
        this.addPlayer(me as IPlayer);
      }

      room.players.forEach((p:IPlayer)=>{
        if(p.id != me.id){
          this.addPlayer(p)
        }
      })
    });
  }

  ngOnDestroy(): void {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }

    this.webRTC.unsubscribeToGameEvent(this.handleGameEvent);
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    console.log("Add user: ", user);
    if(user.type == UserType.Player){
      this.addPlayer(user as IPlayer);
    }
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
      case GameEvent.ModifyPlayerProperty:
        this.updatePlayers([event.response]);
        break;
      case GameEvent.StartGame:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ResetGame:
        this.updatePlayers(event.response);
        break;
      case GameEvent.EndCurrentTurn:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ToggleMonarch:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ModifyPlayerCommanderDamage:
        this.updatePlayers([event.response]);
        break;
      case GameEvent.SetCommander:
        this.updatePlayers([event.response]);
        break;
    }
  }

  addPlayer = (newPlayer: IPlayer) => {
    let foundPlayer = this.getPlayer(newPlayer.id)

    if (!foundPlayer) {
      this.gameService.room.players.push(newPlayer);
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
      const existingPlayer = this.gameService.room.players.find(p => p.id === newPlayer.id);
      if (existingPlayer) {
        Object.assign(existingPlayer, newPlayer); // This updates only the fields that have changed
      }
    });
  }

  getPlayer = (id: string) => {
    return this.gameService.room.players.find(p => p.id === id);
  }

  sortPlayers = () => {
    if (this.gameService.room && this.gameService.room.players) {
      this.sortedPlayers = this.gameService.room.players.sort((a, b) => a.turnOrder - b.turnOrder);
    }


    if(this.sortedPlayers.length == 4){
      let temp:IPlayer = this.sortedPlayers[2];
      this.sortedPlayers[2] = this.sortedPlayers[3];
      this.sortedPlayers[3] = temp;
    }
  }

  startGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.StartGame });
  }

  resetGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.ResetGame });
  }

  randomizeTurnOrder = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.RandomizePlayerOrder });
  }

  copyUrl() {
    const currentUrl = window.location.href; // Get the current URL
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.alertService.addAlert('success','URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

}
