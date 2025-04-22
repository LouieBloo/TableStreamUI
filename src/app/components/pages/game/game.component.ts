import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { GameEvent, IGameEvent, LocalGameEvent} from '../../../interfaces/IGame';
import { UserInputAction } from '../../../interfaces/inputs';
import { IPlayer, IUser, UserType } from '../../../interfaces/IPlayer';
import { IKickPlayerResponse, IRoom, PasswordCheckResponse } from '../../../interfaces/IRoom';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { GameService } from '../../../services/game/game.service';
import { InputService } from '../../../services/input/input.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { CardListComponent } from '../../card-list/card-list.component';
import { MessengerComponent } from '../../messaging/messenger/messenger.component';
import { PasswordModalComponent } from '../../modals/password-modal/password-modal.component';
import { PlayerTurnOrderModalComponent } from '../../modals/player-turn-order-modal/player-turn-order-modal.component';
import { ReportModalComponent } from '../../modals/report-modal/report-modal.component';
import { SoundEffectModalComponent } from '../../modals/sound-effect-modal/sound-effect-modal.component';
import { TokenModalComponent } from '../../modals/token-modal/token-modal.component';
import { TimerComponent } from '../../timer/timer.component';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { CardTokenComponent } from '../../tokens/card-token/card-token.component';
import { UserStreamComponent } from '../../users/user-stream/user-stream.component';
import { Token } from '../../../interfaces/IPlayingCard';
import { DonationButtonComponent } from '../../donation-button/donation-button.component';
import { DonationModalComponent } from '../../modals/donation-modal/donation-modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    UserStreamComponent,
    MessengerComponent,
    NgIf,
    NgClass,
    CardListComponent,
    ReportModalComponent,
    PasswordModalComponent,
    TooltipDirective,
    SoundEffectModalComponent,
    PlayerTurnOrderModalComponent,
    CardTokenComponent,
    TokenModalComponent,
    TimerComponent,
    DonationButtonComponent,
    DonationModalComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  @ViewChild(ReportModalComponent) reportComponent!: ReportModalComponent;
  @ViewChild(PasswordModalComponent) passwordModal!: PasswordModalComponent;
  @ViewChild(SoundEffectModalComponent)
  soundEffectModal!: SoundEffectModalComponent;
  @ViewChild(PlayerTurnOrderModalComponent)
  playerTurnOrderModal!: PlayerTurnOrderModalComponent;
  @ViewChild(TokenModalComponent) tokenModal!: TokenModalComponent;
  @ViewChild(DonationModalComponent) donationModal!: DonationModalComponent;

  private subscriptions: Subscription = new Subscription();
  localPlayerId: string = '';
  localPlayer!: IPlayer;
  roomId!: string;
  showingHotkeys: boolean = false;

  constructor(
    private webRTC: WebRTCService,
    private inputService: InputService,
    public gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertsService,
    private logger: LoggerService,
    public localStorageService: LocalStorageService) {
    this.gameService.room = {
      name: 'temp',
      players: [],
      messages: [],
    };
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.queryParamMap.get('id')!;
    let previousRoomId = this.localStorageService.roomId;
    let hasSetSpectator = this.localStorageService.hasSetSpectator;

    if (!this.localStorageService.hasPlayedBefore) {
      this.showingHotkeys = true;
      this.localStorageService.setHasPlayedBefore("true");
      setTimeout(() => { this.showingHotkeys = false }, 1000 * 60 * 5)
    }
    
    if (!this.localStorageService.playerName || !hasSetSpectator || (previousRoomId && this.roomId != previousRoomId)) {
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

    this.subscribeToPassTurn();
    this.subscribeToUserJoined();
    this.subscribeToGameEvent();
    this.checkPasswordProtection(this.roomId);
  }

  subscribeToGameEvent(){
    this.subscriptions.add(
      this.webRTC.gameEvent.subscribe((event) => this.handleGameEvent(event))
    );
  }

  subscribeToUserJoined(){
    this.subscriptions.add(
      this.webRTC.userJoined.subscribe((user) => this.userJoined(user))
    );
  }
  
  subscribeToPassTurn(){
    this.subscriptions.add(
      this.inputService.subscribe((userAction: UserInputAction) => {
        if (userAction == UserInputAction.PassTurn) {
          this.webRTC.sendGameEvent({ event: GameEvent.EndCurrentTurn });
        }
      })
    );
  }

  checkPasswordProtection = async (roomId: string) => {
    const storedPassword = this.localStorageService.password;

    if (storedPassword) {
      this.loadIntoGame(storedPassword);
      return;
    }

    this.subscriptions.add(
      this.gameService.checkPasswordProtection(roomId).subscribe({
        next: (response: PasswordCheckResponse) => {
          if (response.result === true) {
            this.passwordModal.open();
          } else {
            this.loadIntoGame(null);
          }
        },
        error: (error: any) => {
          this.logger.error('Error joining game: ', error);
          alert('Error joining game: ' + error);
        },
      })
    );
  };


  loadIntoGame(password: string|null) {
    this.localStorageService.setPassword(password + "");

    this.webRTC.joinRoom(
      this.roomId,
      password,
      (me: IUser, roomName: string, room: IRoom) => {
        this.gameService.setRoom(room);
        this.passwordModal.close();
        this.localPlayerId = me.id;

        this.localStorageService.setRoomId(room.id + "");
        this.localStorageService.setPlayerId(me.id);
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
            this.addPlayer(p);
          }
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  userJoined = ({ id, user }: { id: string; user: IUser }) => {
    if (user.type === UserType.Player) {
      this.addPlayer(user as IPlayer);
    }
  };

  handleGameEvent = (event: IGameEvent) => {
    this.logger.log('handling event: ', event);
    switch (event.event) {
      case GameEvent.RandomizePlayerOrder:
        this.updatePlayers(event.response);
        this.gameService.sortPlayers();
        break;
      case GameEvent.ModifyPlayerProperty:
        this.updatePlayers([event.response]);
        break;
      case GameEvent.ModifyGameProperty:
        this.gameService.room.game?.modifyProperty(event.response);
        break;
      case GameEvent.StartGame:
        this.updatePlayers(event.response.players);
        if (this.gameService.room.game) {
          this.gameService.room.game.startedAt = event.response.game.startedAt;
        }
        break;
      case GameEvent.ResetGame:
        this.updatePlayers(event.response.players);
        if (this.gameService.room.game) {
          this.gameService.room.game.startedAt = event.response.game.startedAt;
        }
        break;
      case GameEvent.EndCurrentTurn:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ToggleMonarch:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ToggleInitiative:
        this.updatePlayers(event.response);
        break;
      case GameEvent.ModifyPlayerCommanderDamage:
        this.updatePlayers([event.response]);
        break;
      case GameEvent.SetCommander:
        this.updatePlayers(event.response);
        break;
      case GameEvent.SetPlayerTurnOrders:
        this.updatePlayers(event.response);
        this.gameService.sortPlayers();
        break;
      case GameEvent.CreateToken:
        if (this.gameService.room.game) {
          this.gameService.room.game.createToken(event.response);
        }
        break;
      case GameEvent.DeleteToken:
        if (this.gameService.room.game) {
          this.gameService.room.game.removeToken(event.response);
        }
        break;
      case GameEvent.KickPlayer:
        const kickedResponse:IKickPlayerResponse = event.response
        //remove all tokens
        kickedResponse.removedTokens.forEach((token:Token)=>{
          this.gameService.room.game?.removeToken(token);
        })

        //remove player
        this.gameService.removePlayer(kickedResponse.kickedPlayer?.id);

        //update players (turn order, commander damages)
        this.updatePlayers(kickedResponse.players);
        break;
    }
  };

  addPlayer = (newPlayer: IPlayer) => {
    let foundPlayer = this.getPlayer(newPlayer.id);

    if (!foundPlayer) {
      this.gameService.room.players.push(newPlayer);
    } else {
      //update the socketId
      foundPlayer.socketId = newPlayer.socketId;
    }

    this.gameService.sortPlayers();

    return foundPlayer;
  };

  updatePlayers(newPlayers: IPlayer[]): void {
    if (!newPlayers) { return; }

    newPlayers.forEach((newPlayer) => {
      const existingPlayer = this.gameService.room.players.find(
        (p) => p.id === newPlayer.id
      );
      if (existingPlayer) {
        Object.assign(existingPlayer, newPlayer); // This updates only the fields that have changed
      }
    });
  }

  getPlayer = (id: string) => {
    return this.gameService.room.players.find((p) => p.id === id);
  };

  get topRowPlayers() {
    switch (this.gameService.room.players.length) {
      case 1:
        return this.gameService.room.players;
      case 2:
        return this.gameService.room.players;
      case 3:
        return this.gameService.room.players.slice(0, 2);
      case 4:
        return this.gameService.room.players.slice(0, 2);
      case 5:
        return this.gameService.room.players.slice(0, 3);
      case 6:
        return this.gameService.room.players.slice(0, 3);
    }

    return [];
  }

  get bottomRowPlayers() {
    switch (this.gameService.room.players.length) {
      case 1:
        return [];
      case 2:
        return [];
      case 3:
        return [this.gameService.room.players[2]];
      case 4:
        //notice the change in order, always clockwise rotation
        return [this.gameService.room.players[3], this.gameService.room.players[2]];
      case 5:
        return [this.gameService.room.players[4], this.gameService.room.players[3]];
      case 6:
        return [
          this.gameService.room.players[5], this.gameService.room.players[4], this.gameService.room.players[3]];
    }

    return [];
  }

  startGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.StartGame });
  };

  resetGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.ResetGame });
  };

  // This is purely for the chrome autoplay policy, user needs to interact with the page before we can auto play the video streams
  rejoinGame = ()=>{
    this.webRTC.sendLocalGameEvent({
      event: LocalGameEvent.RejoinGame
    });

    this.localStorageService.setUserInteractedWithSite(true);
  }

  copyUrl() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.alertService.addAlert('success', 'URL copied to clipboard!');
    }).catch(err => {
      this.logger.error("Failed to copy", err)
    });
  }

  goBack() {
    this.router.navigate(['/join']);
  }

  flipCoins = (coinsToFlip: number) => {
    this.webRTC.sendLocalGameEvent({
      event: LocalGameEvent.FlipCoins,
      callingPlayer: this.localPlayer,
      payload: { coinsToFlip: coinsToFlip },
    });
  };

  rollDice = (dicesToRoll: Number, sidedDice: number) => {
    this.webRTC.sendGameEvent({
      event: GameEvent.RollDice,
      payload: { dicesToRoll: dicesToRoll, sidedDice: sidedDice },
    });
  };
}
