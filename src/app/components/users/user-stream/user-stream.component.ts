import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';
import { IPlayer, IUser, PlayerProperties } from '../../../interfaces/IPlayer';
import {
  GameEvent,
  IGameEvent,
  IModifyPlayerProperty,
  LocalGameEvent,
} from '../../../interfaces/IGame';
import { LifeTotalComponent } from '../../life-total/life-total.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { GameService } from '../../../services/game/game.service';
import { SetCommanderComponent } from '../../commander/set-commander/set-commander.component';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CardIdentifierService } from '../../../services/card-identifier/card-identifier.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { environment } from '../../../../environments/environment';
import { CoinFlipperComponent } from '../../coin-flip/coin-flipper/coin-flipper.component';
import { ReactionsComponent } from '../../effects/reactions/reactions.component';
import { TimerComponent } from '../../timer/timer.component';
import { IPlayingCard } from '../../../interfaces/IPlayingCard';
import { BoundingBoxComponent } from '../../bounding-box/bounding-box.component';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { Router } from '@angular/router';
import {
  catchError,
  from,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { IKickPlayerResponse } from '../../../interfaces/IRoom';
import { CommanderSideBarComponent } from '../../commander/commander-side-bar/commander-side-bar.component';
import { LifeTotalDropzoneComponent } from '../../life-total/life-total-dropzone/life-total-dropzone.component';
import {
  gameCrown,
  gameHealthNormal,
  gamePoisonBottle,
  gamePowerLightning,
  gameBrokenHeart,
  gameDiceSixFacesFive,
  gameFairyWand,
  gameTorch,
  gameModernCity,
  gameSunCloud,
  gameDeathSkull,
  gameRadioactive,
  gameHearts,
} from '@ng-icons/game-icons';
import { CardClassifiedPopupComponent } from '../../card-classified-popup/card-classified-popup.component';
import { LocalDevicesService } from '../../../services/devices/devices.service';

@Component({
  selector: 'app-user-stream',
  standalone: true,
  imports: [
    NgIconComponent,
    LifeTotalComponent,
    NgClass,
    NgIf,
    CommonModule,
    SetCommanderComponent,
    TooltipDirective,
    CoinFlipperComponent,
    ReactionsComponent,
    TimerComponent,
    BoundingBoxComponent,
    CommanderSideBarComponent,
    LifeTotalDropzoneComponent,
    CardClassifiedPopupComponent,
  ],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [
    provideIcons({
      bootstrapGearFill,
      gameCrown,
      gameHealthNormal,
      gamePoisonBottle,
      gamePowerLightning,
      gameBrokenHeart,
      gameDiceSixFacesFive,
      gameFairyWand,
      gameTorch,
      gameModernCity,
      gameSunCloud,
      gameDeathSkull,
      gameRadioactive,
      gameHearts,
    }),
  ],
})
export class UserStreamComponent {
  @Input() player!: IPlayer;
  @Input() isLocalStream: boolean = false;
  @Input() isFocusedLayout: boolean = false;
  @Output() reportPlayerEvent: EventEmitter<string> =
    new EventEmitter<string>();

  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;
  @ViewChildren(LifeTotalComponent)
  lifeTotalComponents!: QueryList<LifeTotalComponent>;

  magicLifeTotalComponent!: LifeTotalComponent;

  private subscriptions: Subscription = new Subscription();
  showCommanderDamage: boolean = true;
  muted: boolean = false;
  volume: number = 1;
  audioInputDevices$: Observable<MediaDeviceInfo[]> = of([]);
  videoInputDevices$: Observable<MediaDeviceInfo[]> = of([]);
  selectedAudioDeviceId: string = '';
  selectedVideoDeviceId: string = '';
  videoQuality: string;
  isMutedSelf: boolean = false;
  isVideoOff: boolean = false;
  loadingCardIdentification: boolean = false;
  boundingBox: any;
  classifiedCard: IPlayingCard | null = null;
  popupPosition = { x: 0, y: 0 };
  showCardPopup = false;

  // only used to change the direction the settings menu renders
  get isBottomRow(): boolean {
    if (!this.isFocusedLayout) {
      return false;
    }
    if (!this.gameService.isActiveGame) {
      return this.player.turnOrder != 0;
    }

    return !this.player.isTakingTurn;
  }

  constructor(
    private webRTC: WebRTCService,
    public gameService: GameService,
    private cardIdentifierService: CardIdentifierService,
    private logger: LoggerService,
    private alertService: AlertsService,
    private ngZone: NgZone,
    private localStorageService: LocalStorageService,
    private router: Router,
    public devicesService: LocalDevicesService
  ) {
    this.videoQuality = localStorageService.videoQuality || '16/9-1080';
    this.audioInputDevices$ = devicesService.audioDevices$;
    this.videoInputDevices$ = devicesService.videoDevices$;
    this.subscribeToEvents();
  }

  subscribeToLocalStream() {
    this.devicesService.localStream$
      .pipe(
        tap((stream: MediaStream | null) => {
          if (stream) this.displayLocalStream(stream);
        }),
        catchError((error: Error) => {
          console.error('Error initializing local stream:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  async ngAfterViewInit() {
    if (this.isLocalStream) {
      this.subscribeToLocalStream();
      await this.devicesService.setDevices(); //TODO rename method
    }
    if (!this.isLocalStream) {
      this.webRTC.subscribeToStreamAdd(this.streamAdded);
      this.setStream(this.webRTC.getRemoteStreamBySocketId(this.player.socketId));
    }
    this.setFlip();

    //so we dont get a ngAfter change error
    setTimeout(() => {
      this.lifeTotalComponents.forEach((child) => {
        if (child.id == 'magicLifeTotal') {
          this.magicLifeTotalComponent = child;
        }
      });
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  subscribeToEvents() {
    this.subscriptions.add(
      this.gameService.kickedPlayerEvent$.subscribe((event) => {
        if (this.imKicked(event?.response)) {
          this.router.navigate(['/join']);
        }
      })
    );

    this.subscriptions.add(
      this.webRTC.localGameEvent.subscribe((localGameEvent: IGameEvent) => {
        if (
          localGameEvent.event === LocalGameEvent.RejoinGame &&
          !this.isLocalStream
        ) {
          this.video.nativeElement.play().catch((err) => {
            console.error('Error auto-playing:', err);
          });
        }
      })
    );
  }

  setStream = (stream: MediaStream | null) => {
    if (this.video.nativeElement && stream) {
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.volume = this.volume;
      this.video.nativeElement.muted = this.muted;
    }
  };

  private displayLocalStream(stream: MediaStream): void {
    if (this.video.nativeElement) {
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.muted = true;
    }

    const isMicMuted = this.localStorageService.isMicMuted;
    this.isMutedSelf = isMicMuted === 'true';
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    if (user.id === this.player.id) {
      this.setStream(this.webRTC.getRemoteStreamBySocketId(this.player.socketId));
    }
  };

  streamRemoved = (id: string) => {
    if (id === this.player.socketId) {
      this.setStream(null);
    }
  };

  onAudioDeviceChange(event: any) {
    this.selectedAudioDeviceId = event.target.value;
    this.changeDeviceReactive();
  }

  onVideoDeviceChange(event: any) {
    this.selectedVideoDeviceId = event.target.value;
    this.changeDeviceReactive();
  }

  changeDeviceReactive() {
    from(
      this.webRTC.changeDevice(
        this.devicesService.selectedVideoDeviceId.value,
        this.devicesService.selectedAudioDeviceId.value
      )
    )
      .pipe(
        switchMap(() =>
          from(
            this.devicesService.buildLocalStream(
              this.devicesService.selectedVideoDeviceId.value,
              this.devicesService.selectedAudioDeviceId.value
            )
          )
        )
      )
      .subscribe({
        next: (stream: MediaStream | null) => {
          if (!stream) return;
          this.displayLocalStream(stream);
        },
        error: (err) => console.error('Error changing device:', err),
      });
  }

  onVideoQualityChange(event: any) {
    this.videoQuality = event.target.value;
    this.localStorageService.setVideoQuality(this.videoQuality);
    this.changeDeviceReactive();
  }

  toggleMuteSelf() {
    this.isMutedSelf = !this.isMutedSelf;
    this.localStorageService.setMicMuted(this.isMutedSelf + '');
    if (this.isMutedSelf) {
      this.devicesService.muteSelf();
    } else {
      this.devicesService.unmuteSelf();
    }
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    if (this.isVideoOff) {
      this.devicesService.turnOffVideo();
    } else {
      this.devicesService.turnOnVideo();
    }
  }

  // Volume control for remote streams
  onVolumeChange(event: any) {
    this.volume = event.target.value;
    if (this.video.nativeElement) {
      this.video.nativeElement.volume = this.volume;
    }
  }

  muteRemoteUser(): void {
    const remoteStream = this.webRTC.getRemoteStreamBySocketId(this.player.socketId);
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = false));
      this.muted = true;
    }
  }

  unmuteRemoteUser(): void {
    const remoteStream = this.webRTC.getRemoteStreamBySocketId(this.player.socketId);
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = true));
      this.muted = false;
    }
  }

  makeAdmin = (player: IPlayer) => {
    const payload: IModifyPlayerProperty = {
      property: PlayerProperties.isAdmin,
      value: player.id,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
    this.alertService.addAlert('success', 'Admin given to ' + player.name);
  };

  modifyLifeTotal = (amount: number) => {
    let payload: IModifyPlayerProperty = {
      amountToModify: amount,
      property: PlayerProperties.lifeTotal,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  modifyPoisonTotal = (amount: number) => {
    let payload: IModifyPlayerProperty = {
      amountToModify: amount,
      property: PlayerProperties.poisonTotal,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  modifyEnergyTotal = (amount: number) => {
    let payload: IModifyPlayerProperty = {
      amountToModify: amount,
      property: PlayerProperties.energyTotal,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  modifyRadiationTotal = (amount: number) => {
    let payload: IModifyPlayerProperty = {
      amountToModify: amount,
      property: PlayerProperties.radiationTotal,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  modifyPrizeCardTotal = (amount: number) => {
    let payload: IModifyPlayerProperty = {
      amountToModify: amount,
      property: PlayerProperties.prizeCards,
    };
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  toggleCommanderDamages = () => {
    this.showCommanderDamage = !this.showCommanderDamage;
  };

  setFlip() {
    this.video.nativeElement.style.transform = this.player.cameraFlipped
      ? 'scaleX(-1) scaleY(-1)'
      : 'scaleX(1) scaleY(1)';
  }

  toggleFlip(): void {
    this.player.cameraFlipped = !this.player.cameraFlipped;
    this.setFlip();
  }

  kickPlayer() {
    this.reportPlayerEvent.emit(this.player.id);
  }

  toggleImageSharing = async () => {
    this.localStorageService.setIsSharingImages(
      !this.player.isSharingImages + ''
    );
    let payload: IModifyPlayerProperty = {
      value: !this.player.isSharingImages,
      property: PlayerProperties.sharingImages,
    };
    let response = await this.webRTC.sendPrivateGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
  };

  modifyCommanderDamage = (
    playerId: string,
    amount: number,
    card: IPlayingCard
  ) => {
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerCommanderDamage,
      payload: {
        damagingPlayer: this.gameService.getPlayerById(playerId),
        amount: amount,
        card: card,
      },
    });
  };

  getModifyCommanderDamageCallback = (
    playerId: string,
    card: IPlayingCard
  ): ((amount: number) => void) => {
    return (amount: number): void => {
      this.modifyCommanderDamage(playerId, amount, card);
    };
  };

  isFirefox(): boolean {
    return /firefox/i.test(navigator.userAgent);
  }

  onVideoClick(event: MouseEvent) {
    if (this.loadingCardIdentification) {
      this.alertService.addAlert(
        'error',
        'Only 1 image can be classified at once'
      );
      return;
    }

    if (
      !environment.cardIdentifierActive ||
      !this.gameService.isClassifierActive
    ) {
      return;
    }

    this.loadingCardIdentification = true;

    // Get the click position relative to the video
    const videoElement = this.video.nativeElement; // Access the video element from ElementRef
    const rect = videoElement.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Normalize the click position based on the video size
    const normalizedX = clickX / rect.width;
    const normalizedY = clickY / rect.height;

    // Create a canvas to capture the current frame from the video
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      // Check if the camera is flipped and apply the necessary transformation
      if (this.player.cameraFlipped) {
        // Flip the canvas horizontally and/or vertically based on the flipped state
        context.scale(-1, -1); // Flip both X and Y axis
        context.translate(-canvas.width, -canvas.height); // Move the context back to the origin after flipping
      }

      this.dismissCardPopup();

      // Draw the current frame of the video onto the canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert the canvas content to a Blob (image file)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a file from the Blob to send to the service
            const photoFile = new File([blob], 'current_frame.jpg', {
              type: 'image/jpeg',
            });

            // Send the file and normalized click position to the classification service
            this.cardIdentifierService
              .classifyImage(
                photoFile,
                normalizedX,
                normalizedY,
                this.player.id
              )
              .subscribe(
                (response: any) => {
                  this.ngZone.run(() => {
                    if (response && response.scryfall_data) {
                      this.classifiedCard = {
                        ...response.scryfall_data,
                        classificationConfidence:
                          response.classification_confidence,
                      };
                      this.popupPosition = {
                        x: event.clientX,
                        y: event.clientY,
                      };
                      this.showCardPopup = true; // This will make the popup appear
                      this.boundingBox = response.bounding_box;
                    }
                    this.loadingCardIdentification = false;
                  });
                },
                (error: any) => {
                  this.logger.error('Error classifying image:', error);

                  this.ngZone.run(() => {
                    this.loadingCardIdentification = false;
                  });
                }
              );
          }

          canvas.remove();
        },
        'image/jpeg',
        1.0
      );
    }
  }

  /**
   * Handles the (share) event emitted from the card popup.
   * @param card The card data to be shared.
   */
  shareCard = ({
    card,
    sharePublic,
  }: {
    card: IPlayingCard;
    sharePublic: boolean;
  }) => {
    this.webRTC.sendLocalGameEvent({
      event: LocalGameEvent.ShareCard,
      payload: { card, sharePublic },
    });
    this.dismissCardPopup();
  };

  /**
   * Hides the popup and clears its data.
   * Can be called from the (dismiss) event or manually.
   */
  dismissCardPopup() {
    this.showCardPopup = false;
    this.classifiedCard = null;
  }

  private imKicked(kickedEvent: IKickPlayerResponse) {
    return this.player.id == kickedEvent.kickedPlayer?.id && this.isLocalStream;
  }
}
