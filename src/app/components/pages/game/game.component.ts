import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import {
  GameEvent,
  LocalGameEvent,
} from '../../../interfaces/IGame';
import { UserInputAction } from '../../../interfaces/inputs';
import { IPlayer, IUser, UserType } from '../../../interfaces/IPlayer';
import {
  IRoom,
  PasswordCheckResponse,
} from '../../../interfaces/IRoom';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { GameService } from '../../../services/game/game.service';
import { InputService } from '../../../services/input/input.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { CardListComponent } from '../../card-list/card-list.component';
import { PasswordModalComponent } from '../../modals/password-modal/password-modal.component';
import { PlayerTurnOrderModalComponent } from '../../modals/player-turn-order-modal/player-turn-order-modal.component';
import { ReportModalComponent } from '../../modals/report-modal/report-modal.component';
import { SoundEffectModalComponent } from '../../modals/sound-effect-modal/sound-effect-modal.component';
import { TokenModalComponent } from '../../modals/token-modal/token-modal.component';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { CardTokenComponent } from '../../tokens/card-token/card-token.component';
import { UserStreamComponent } from '../../users/user-stream/user-stream.component';
import { DonationButtonComponent } from '../../donations/donation-button/donation-button.component';
import { DonationModalComponent } from '../../modals/donation-modal/donation-modal.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheck,
  bootstrapChevronDoubleLeft,
} from '@ng-icons/bootstrap-icons';
import { SidebarGameInfoComponent } from '../../sidebar/sidebar-game-info/sidebar-game-info.component';
import { ReportUserModalComponent } from '../../modals/report-user-modal/report-user-modal.component';
import { GameLogModalComponent } from '../../modals/game-log-modal/game-log-modal.component';
import { LocalDevicesService } from '../../../services/devices/devices.service';
import { QrCodeModalComponent } from '../../modals/qr-code-modal/qr-code-modal.component';
import { MessengerComponent } from '../../messaging/messenger/messenger.component';
import { SettingsService } from '../../../services/settings/settings.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    UserStreamComponent,
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
    DonationButtonComponent,
    DonationModalComponent,
    NgStyle,
    NgIcon,
    SidebarGameInfoComponent,
    ReportUserModalComponent,
    GameLogModalComponent,
    AsyncPipe,
    QrCodeModalComponent,
    MessengerComponent
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  viewProviders: [provideIcons({ bootstrapCheck, bootstrapChevronDoubleLeft })],
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
  @ViewChild(ReportUserModalComponent)
  reportUserModal!: ReportUserModalComponent;
  @ViewChild(GameLogModalComponent) gameLogModal!: GameLogModalComponent;
  @ViewChild(QrCodeModalComponent) qrCodeModal!: QrCodeModalComponent;


  private subscriptions: Subscription = new Subscription();
  roomId!: string;
  showingHotkeys: boolean = false;
  focusedLayout: boolean = false;
  initialLoad: boolean = true;
  showChatbox: boolean = true;
  unreadMessages: number = 0;
  localPlayer$: Observable<IPlayer | null | undefined> = of(null);
  showSideBar: boolean = true;
  showQrCode: boolean = false;
  devicesService = inject(LocalDevicesService);
  
  get focusedIndex(): number {
    return this.gameService.getPlayerTakingTurnIndex();
  }

  constructor(
    public webRTC: WebRTCService,
    private inputService: InputService,
    public gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertsService,
    private logger: LoggerService,
    private settingsService:SettingsService,
    public localStorageService: LocalStorageService
  ) {
    this.gameService.setTempRoom();
    this.localPlayer$ = this.gameService.localPlayer$;
  }


  ngOnInit() {
    this.roomId = this.route.snapshot.queryParamMap.get('id')!;
    this.handleFirstTimePlayer();

    if (this.shouldRedirectToJoin()){
      this.redirect();
      return;
    }

    this.subscribeToPassTurn();
    this.subscribeToUserJoined();
    this.checkPasswordProtection(this.roomId);
  }

  private handleFirstTimePlayer(){
    if (!this.localStorageService.hasPlayedBefore) {
      this.showingHotkeys = true;
      this.localStorageService.setHasPlayedBefore('true');
      setTimeout(() => {
        this.showingHotkeys = false;
      }, 1000 * 60 * 5);
    }
  }

  private shouldRedirectToJoin(){
    const previousRoomId = this.localStorageService.roomId;
    const hasSetSpectator = this.localStorageService.hasSetSpectator;

    return (
      !this.localStorageService.playerName ||
      !hasSetSpectator ||
      (previousRoomId && this.roomId != previousRoomId)
    )
  }

  private redirect(){
    if (this.roomId) {
      this.router.navigate(['/join'], {
        queryParams: { id: this.roomId },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['/join']);
    }
  }

  subscribeToUserJoined() {
    this.subscriptions.add(
      this.webRTC.userJoined.subscribe((user) => this.userJoined(user))
    );
  }

  subscribeToPassTurn() {
    this.subscriptions.add(
      this.inputService.subscribe(
        ({ action, payload }: { action: UserInputAction; payload?: any }) => {
          if (action == UserInputAction.PassTurn) {
            this.webRTC.sendGameEvent({ event: GameEvent.EndCurrentTurn });
          }
        }
      )
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
          alert('Error joining game: ' + error.message);
        },
      })
    );
  };

  onSuccessfulLoadIntoGame = (me: IUser, room: IRoom) => {
    this.gameService.setRoom(room, me.id);
    this.passwordModal.close();

    this.localStorageService.setRoomId(room.id + '');
    this.localStorageService.setPlayerId(me.id);
    this.router.navigate([], {
      queryParams: { id: room.id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    if (me.type == UserType.Player) {
      this.addPlayer(me as IPlayer);
    }

    room.players.forEach((p: IPlayer) => {
      if (p.id != me.id) {
        this.addPlayer(p);
      }
    });

    this.initialLoad = false;
  };

  loadIntoGame(password: string | null) {
    this.localStorageService.setPassword(password + '');
    this.webRTC.joinRoom(this.roomId, password, this.onSuccessfulLoadIntoGame);
  }

  userJoined = ({ id, user }: { id: string; user: IUser }) => {
    if (user.type === UserType.Player) {
      this.addPlayer(user as IPlayer);
    }
  };

  addPlayer = (newPlayer: IPlayer) => {
    this.gameService.addPlayer(newPlayer);
  };

  sortPlayers(){
    this.gameService.sortPlayers();
  }

  updatePlayers(newPlayers: IPlayer[]): void {
    this.gameService.updatePlayers(newPlayers);
  }

  startGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.StartGame });
  };

  resetGame = () => {
    this.webRTC.sendGameEvent({ event: GameEvent.ResetGame });
  };

  // This is purely for the chrome autoplay policy, user needs to interact with the page before we can auto play the video streams
  rejoinGame = () => {
    this.webRTC.sendLocalGameEvent({
      event: LocalGameEvent.RejoinGame,
    });

    this.localStorageService.setUserInteractedWithSite(true);
  };

  copyUrl() {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        this.alertService.addAlert('success', 'URL copied to clipboard!');
      })
      .catch((err) => {
        this.logger.error('Failed to copy', err);
      });
  }

  goBack() {
    this.router.navigate(['/join']);
  }

  flipCoins = (coinsToFlip: number, player: IPlayer) => {
    this.webRTC.sendLocalGameEvent({
      event: LocalGameEvent.FlipCoins,
      callingPlayer: player!,
      payload: { coinsToFlip: coinsToFlip },
    });
  };

  rollDice = (dicesToRoll: Number, sidedDice: number) => {
    this.webRTC.sendGameEvent({
      event: GameEvent.RollDice,
      payload: { dicesToRoll: dicesToRoll, sidedDice: sidedDice },
    });
  };

  openDonationModel = () => {
    this.donationModal.open();
  };

  //TEST
  openReportUserModal = (offenderPlayerId: string) => {
    this.reportUserModal.open(offenderPlayerId, this.gameService.roomId + '');
  };

  /**
   * Returns the CSS flex‐order for the i'th player in the raw array,
   * so they appear in the correct slot in non‐focused or focused layouts.
   */
  getOrder(i: number): number {
    const n = this.gameService.numberOfPlayersInRoom;
    const turnOrder = this.gameService.getPlayerTurnOrder(i);
    if (this.focusedLayout) {
      // Focused: player whose turn it is always order=0,
      // then the rest follow in turnOrder wraparound
      return (
        (turnOrder - (this.focusedIndex >= 0 ? this.focusedIndex : 0) + n) % n
      );
    } else {

      const map: Record<number, number[]> = {
        1: [0],
        2: [0, 1],
        3: [0, 1, 2],
        4: [0, 1, 3, 2],
        5: [0, 1, 2, 4, 3],
        6: [0, 1, 2, 5, 4, 3],
      } as any;

      const ordering = map[n] || map[1];
      return ordering[turnOrder];
    }
  }

  /**
   * Computes flex-basis (%) and height (%) for each player slot,
   * for both normal and focused layouts.
   */
  computeFlexStyles(i: number): { [key: string]: string } {
    const n = this.gameService.numberOfPlayersInRoom;

    if (!this.focusedLayout) {
      // original two-row logic:
      let topCount: number, bottomCount: number;
      switch (n) {
        case 1:
          topCount = 1;
          bottomCount = 0;
          break;
        case 2:
          topCount = 2;
          bottomCount = 0;
          break;
        case 3:
          topCount = 2;
          bottomCount = 1;
          break;
        case 4:
          topCount = 2;
          bottomCount = 2;
          break;
        case 5:
          topCount = 3;
          bottomCount = 2;
          break;
        case 6:
          topCount = 3;
          bottomCount = 3;
          break;
        default:
          topCount = n;
          bottomCount = 0;
      }

      if (i < topCount) {
        // top row
        const widthPct = 100 / topCount;
        const heightPct = bottomCount > 0 ? 50 : 100;
        return {
          flexBasis: `${widthPct}%`,
          height: `${heightPct}%`,
        };
      } else {
        // bottom row
        const widthPct = 100 / bottomCount;
        return {
          flexBasis: `${widthPct}%`,
          height: `50%`,
        };
      }
    } else {
      // focused layout
      const othersCount = n - 1;
      // the -1 check is when the game hasnt started so its technically nobodies turn
      if (i === this.focusedIndex || (i === 0 && this.focusedIndex === -1)) {
        // highlighted player
        return {
          flexBasis: `100%`,
          height: `66.6667%`,
        };
      } else {
        // everyone else
        const widthPct = othersCount > 0 ? 100 / othersCount : 100;
        return {
          flexBasis: `${widthPct}%`,
          height: `33.3333%`,
        };
      }
    }
  }

  setLayout(layout:string){
    switch(layout){
      case "DEFAULT":
        this.focusedLayout = false;
        this.settingsService.tokensEnabled = true;
        break;
      case "FOCUSED":
        this.focusedLayout = true;
        this.settingsService.tokensEnabled = false;
        this.alertService.addAlert("warning", "Tokens are automatically disabled in 'Focused' layout. You can re-enable in the tokens settings menu.", 7.5)
        break;
    }
  }

  handleUnreadCount(count: number): void {
    this.unreadMessages = count;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
