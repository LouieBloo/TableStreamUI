import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { GameEvent, IGameEvent } from '../../../interfaces/game';
import { UserInputAction } from '../../../interfaces/inputs';
import { IPlayer, IUser, UserType } from '../../../interfaces/player';
import { IRoom, PasswordCheckResponse } from '../../../interfaces/room';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { GameService } from '../../../services/game/game.service';
import { InputService } from '../../../services/input/input.service';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { CardListComponent } from '../../card-list/card-list.component';
import { MessengerComponent } from '../../messaging/messenger/messenger.component';
import { PasswordModalComponent } from '../../modals/password-modal/password-modal.component';
import { ReportModalComponent } from '../../modals/report-modal/report-modal.component';
import { UserStreamComponent } from '../../users/user-stream/user-stream.component';
import { LoggerService } from '../../../services/logger/logger.service';

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

  showingHotkeys: boolean = false;

  private inputSubscription!: Subscription;

  @ViewChild(ReportModalComponent) reportComponent!: ReportModalComponent;
  @ViewChild(PasswordModalComponent) passwordModal!: PasswordModalComponent;

  constructor(
    private webRTC: WebRTCService,
    private inputService: InputService,
    public gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertsService,
    private logger: LoggerService) {
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

    if (!localStorage.getItem('hasPlayedBefore')) {
      this.showingHotkeys = true;
      localStorage.setItem('hasPlayedBefore', 'true');
      setTimeout(() => { this.showingHotkeys = false }, 1000 * 60 * 5)
    }
    
    if (!localStorage.getItem('playerName') || !hasSetSpectator || (previousRoomId && this.roomId != previousRoomId)) {
      if (this.roomId) {
        this.router.navigate(['/join'], {
          queryParams: { id: this.roomId },
          queryParamsHandling: 'merge',
        });
      } else {
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

  checkPasswordProtection = async (roomId: string) => {
    const storedPassword = localStorage.getItem("password");

    if (storedPassword) {
      this.loadIntoGame(storedPassword);
      return;
    }

    this.gameService.checkPasswordProtection(roomId).subscribe({
      next: (response: PasswordCheckResponse) => {
        if (response.result === true) {
          this.passwordModal.open();
        } else {
          this.loadIntoGame(null);
        }
      },
      error: (error: any) => {
        this.logger.error("Error joining game: ", error);
        alert('Error joining game: ' + error);
      },
    });

  }

  loadIntoGame(password: string|null) {
    localStorage.setItem("password", password + "");
    const amISpectator = localStorage.getItem("isSpectator") && localStorage.getItem("isSpectator") == 'true';
    const gameType = localStorage.getItem("gameType");
    const playerName = localStorage.getItem('playerName');
    const roomName = localStorage.getItem('roomName');
    const maxPlayers: number = parseInt(localStorage.getItem("maxPlayers") || "4");

    this.webRTC.joinRoom(
      playerName,
      this.roomId,
      password,
      gameType,
      roomName,
      amISpectator ? UserType.Spectator : UserType.Player,
      maxPlayers,
      (me: IUser, roomName: string, room: IRoom) => {
      this.gameService.setRoom(room);
      this.passwordModal.close();
      this.localPlayerId = me.id;

      localStorage.setItem('roomId', room.id + "")
      localStorage.setItem("playerId", me.id);
      this.router.navigate([], {
        queryParams: { id: room.id },
        queryParamsHandling: 'merge', // This merges with any existing query params
        replaceUrl: true // Replace the current URL in history
      });

      if (me.type == UserType.Player) {
        this.localPlayer = me as IPlayer;
        this.addPlayer(me as IPlayer);
      }

      room.players.forEach((p: IPlayer) => {
        if (p.id != me.id) {
          this.addPlayer(p)
        }
      })
    });
  }



  test123(): void {
    this.gameService.room.players.push(
      { ...this.localPlayer, name: "BS-" + this.gameService.room.players.length, turnOrder: this.gameService.room.players.length + 1 });
    this.sortPlayers();
  }

  ngOnDestroy(): void {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }

    this.webRTC.unsubscribeToGameEvent(this.handleGameEvent);
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    if (user.type == UserType.Player) {
      this.addPlayer(user as IPlayer);
    }
    // this.remoteSocketIds.push(id);
  }

  streamRemoved = (id: string) => {
    // this.remoteSocketIds = this.remoteSocketIds.filter((userId) => userId !== id)
  }

  handleGameEvent = (event: IGameEvent) => {
    this.logger.log("handling event: ", event)
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
    // if(this.sortedPlayers.length == 4){
    //   let temp:IPlayer = this.sortedPlayers[2];
    //   this.sortedPlayers[2] = this.sortedPlayers[3];
    //   this.sortedPlayers[3] = temp;
    // }
  }

  get topRowPlayers() {
    switch (this.sortedPlayers.length) {
      case 1:
        return this.sortedPlayers;
      case 2:
        return this.sortedPlayers;
      case 3:
        return this.sortedPlayers.slice(0, 2);
      case 4:
        return this.sortedPlayers.slice(0, 2);
      case 5:
        return this.sortedPlayers.slice(0, 3);
      case 6:
        return this.sortedPlayers.slice(0, 3);
    }

    return []
  }

  get bottomRowPlayers() {
    switch (this.sortedPlayers.length) {
      case 1:
        return [];
      case 2:
        return [];
      case 3:
        return [this.sortedPlayers[2]];
      case 4:
        //notice the change in order, always clockwise rotation
        return [this.sortedPlayers[3], this.sortedPlayers[2]];
      case 5:
        return [this.sortedPlayers[4], this.sortedPlayers[3]];
      case 6:
        return [this.sortedPlayers[5], this.sortedPlayers[4], this.sortedPlayers[3]];
    }

    return []
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
      this.alertService.addAlert('success', 'URL copied to clipboard!');
    }).catch(err => {
      this.logger.error("Failed to copy", err)
    });
  }

  goBack(){
    this.router.navigate(['/join']);
  }

}
