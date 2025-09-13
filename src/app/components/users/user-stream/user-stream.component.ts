import { Component, ElementRef, EventEmitter, Input, NgZone, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';
import { IPlayer, IUser, PlayerProperties } from '../../../interfaces/IPlayer';
import { GameEvent, IGameEvent, IModifyPlayerProperty, LocalGameEvent } from '../../../interfaces/IGame';
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
import { Subscription } from 'rxjs';
import { IKickPlayerResponse } from '../../../interfaces/IRoom';
import { CommanderSideBarComponent } from "../../commander/commander-side-bar/commander-side-bar.component";
import { LifeTotalDropzoneComponent } from '../../life-total/life-total-dropzone/life-total-dropzone.component';
import { gameCrown, gameHealthNormal, gamePoisonBottle, gamePowerLightning, gameBrokenHeart, gameDiceSixFacesFive, gameFairyWand, gameTorch, gameModernCity, gameSunCloud, gameDeathSkull, gameRadioactive, gameHearts } from '@ng-icons/game-icons';
import { CardClassifiedPopupComponent } from '../../card-classified-popup/card-classified-popup.component';

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
    CardClassifiedPopupComponent
],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [provideIcons({ 
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
    gameHearts
  })],
})
export class UserStreamComponent {
  @Input() player!: IPlayer;
  @Input() localStream: boolean = false;
  @Input() focusedLayout: boolean = false;
  @Output() reportPlayerEvent: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;
  @ViewChildren(LifeTotalComponent) lifeTotalComponents!: QueryList<LifeTotalComponent>;

  magicLifeTotalComponent!:LifeTotalComponent; 

  private subscriptions: Subscription = new Subscription();
  showCommanderDamage: boolean = true;
  muted: boolean = false;
  volume: number = 1;
  audioInputDevices: MediaDeviceInfo[] = [];
  videoInputDevices: MediaDeviceInfo[] = [];
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
  

  constructor(
    private webRTC: WebRTCService,
    public gameService: GameService,
    private cardIdentifierService: CardIdentifierService,
    private logger: LoggerService,
    private alertService: AlertsService,
    private ngZone: NgZone,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.videoQuality = localStorageService.videoQuality || '16/9-1080'
    this.subscribeToEvents();
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  subscribeToEvents() {
    this.subscriptions.add(
      this.webRTC.kickedPlayerEvent$.subscribe((event) => {
        if (this.imKicked(event.response)) {
          this.router.navigate(['/join']);
        }
      })
    );

    //local events
    this.subscriptions.add(
      this.webRTC.localGameEvent.subscribe((localGameEvent:IGameEvent)=>{
        if (localGameEvent.event === LocalGameEvent.RejoinGame && !this.localStream) {
          this.video.nativeElement.play().catch((err) => {
            console.error('Error auto-playing:', err)
          });
        }
      })
    );
  }

  imKicked(kickedEvent: IKickPlayerResponse){
    return this.player.id == kickedEvent.kickedPlayer?.id && this.localStream
  }

  ngAfterViewInit() {
    if (!this.localStream) {
      this.webRTC.subscribeToStreamAdd(this.streamAdded);
      // this.webRTC.subscribeToStreamRemove(this.streamRemoved);
      this.setStream(this.webRTC.getStream(this.player.socketId));
    } else {
      // Local stream
      // Initialize device lists
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.audioInputDevices = devices.filter(
          (device) => device.kind === 'audioinput'
        );
        this.videoInputDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );

        // Set default selected devices
        if (this.videoInputDevices.length > 0) {
          this.selectedVideoDeviceId = this.videoInputDevices[0].deviceId;
        }
        if (this.audioInputDevices.length > 0) {
          this.selectedAudioDeviceId = this.audioInputDevices[0].deviceId;
        }

        // Initialize local stream with selected devices
        this.initLocalStream();
      });
    }

    this.setFlip();

    //so we dont get a ngAfter change error
    setTimeout(() => {
      this.lifeTotalComponents.forEach(child => {
      if(child.id == 'magicLifeTotal'){
        this.magicLifeTotalComponent = child;
      }
    });
    }, 100);
    
  }

  initLocalStream() {
    this.webRTC
      .initLocalStream(this.selectedVideoDeviceId, this.selectedAudioDeviceId)
      .then((stream) => {
        if (this.video.nativeElement) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.muted = true; // Mute local video to prevent echo
        }

        navigator.mediaDevices.enumerateDevices().then((devices) => {
          this.audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
          this.videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
        });

      //check if we have saved a mic muted preference
      const isMicMuted = this.localStorageService.isMicMuted
      this.isMutedSelf = isMicMuted && isMicMuted == 'true' ? true: false;
    })
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    if (user.id === this.player.id) {
      //this.setStream(stream);
      this.setStream(this.webRTC.getStream(this.player.socketId));
    }
  };

  streamRemoved = (id: string) => {
    if (id === this.player.socketId) {
      this.setStream(null);
    }
  };

  setStream = (stream: MediaStream | null) => {
    if (this.video.nativeElement && stream) {
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.volume = this.volume;
      this.video.nativeElement.muted = this.muted;
    }
  };

  // Methods for device selection
  onAudioDeviceChange(event: any) {
    this.selectedAudioDeviceId = event.target.value;
    this.changeDevice();
  }

  onVideoDeviceChange(event: any) {
    this.selectedVideoDeviceId = event.target.value;
    this.changeDevice();
  }

  changeDevice() {
    this.webRTC
      .changeDevice(this.selectedVideoDeviceId, this.selectedAudioDeviceId)
      .then(() => {
        this.initLocalStream();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onVideoQualityChange(event: any) {
    this.videoQuality = event.target.value;
    this.localStorageService.setVideoQuality(this.videoQuality);
    this.changeDevice();
  }

  toggleMuteSelf() {
    this.isMutedSelf = !this.isMutedSelf;
    this.localStorageService.setMicMuted(this.isMutedSelf + "");
    if (this.isMutedSelf) {
      this.webRTC.muteSelf();
    } else {
      this.webRTC.unmuteSelf();
    }
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    if (this.isVideoOff) {
      this.webRTC.turnOffVideo();
    } else {
      this.webRTC.turnOnVideo();
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
    const remoteStream = this.webRTC.getRemoteStream(this.player.socketId);
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = false));
      this.muted = true;
    }
  }

  unmuteRemoteUser(): void {
    const remoteStream = this.webRTC.getRemoteStream(this.player.socketId);
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach((track) => (track.enabled = true));
      this.muted = false;
    }
  }

  makeAdmin = (player: IPlayer) => {
    const payload: IModifyPlayerProperty = {
      property: PlayerProperties.isAdmin,
      value: player.id
    }
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload: payload,
    });
    this.alertService.addAlert("success","Admin given to " + player.name);
  }

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
    this.video.nativeElement.style.transform = this.player.cameraFlipped ? 'scaleX(-1) scaleY(-1)' : 'scaleX(1) scaleY(1)';
  }

  toggleFlip(): void {
    this.player.cameraFlipped = !this.player.cameraFlipped;
    this.setFlip();
  }

  kickPlayer(playerId: string) {
    // this.webRTC.sendGameEvent({
    //   event: GameEvent.KickPlayer,
    //   payload: {
    //     playerId: playerId,
    //   },
    // });
    this.reportPlayerEvent.emit(this.player.id);
  }

  toggleImageSharing = async()=>{
    this.localStorageService.setIsSharingImages(!this.player.isSharingImages + "");
    let payload:IModifyPlayerProperty = {value: !this.player.isSharingImages, property: PlayerProperties.sharingImages}
    let response = await this.webRTC.sendPrivateGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload:payload
    })
  }

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

  getModifyCommanderDamageCallback = (playerId: string, card: IPlayingCard): ((amount: number) => void) => {
    return (amount: number): void => {
      this.modifyCommanderDamage(playerId, amount, card);
    };
  };
  

  getKeys(object: any): string[] {
    return Object.keys(object);
  }

  isFirefox(): boolean {
    return /firefox/i.test(navigator.userAgent);
  }

  // only used to change the direction the settings menu renders
  get isBottomRow():boolean{
    if(!this.focusedLayout){ return false;}
    if(!this.gameService.room?.game?.active){
      return this.player.turnOrder != 0;
    }

    return !this.player.isTakingTurn;
  }

  onVideoClick(event: MouseEvent) {
    if (this.loadingCardIdentification) {
      this.alertService.addAlert("error", "Only 1 image can be classified at once");
      return;
    }

    if(!environment.cardIdentifierActive || !this.gameService.room.game?.classifierActive){return;}

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
              this.cardIdentifierService.classifyImage(photoFile, normalizedX, normalizedY, this.player.id).subscribe(
                  (response:any) => {
                    this.ngZone.run(() => {
                      if(response && response.scryfall_data){
                        this.classifiedCard = { ...response.scryfall_data, classificationConfidence: response.classification_confidence };
                        this.popupPosition = { x: event.clientX, y: event.clientY}; 
                        this.showCardPopup = true; // This will make the popup appear
                        this.boundingBox = response.bounding_box;
                      }
                      this.loadingCardIdentification = false;
                    });
                  },
                  (error:any) => {
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
  shareCard = ({ card, sharePublic }: { card: IPlayingCard, sharePublic: boolean }) => {
    this.webRTC.sendLocalGameEvent({event:LocalGameEvent.ShareCard, payload: {card, sharePublic }});
    this.dismissCardPopup();
  }

  /**
   * Hides the popup and clears its data.
   * Can be called from the (dismiss) event or manually.
   */
  dismissCardPopup() {
    this.showCardPopup = false;
    this.classifiedCard = null;
  }
}
