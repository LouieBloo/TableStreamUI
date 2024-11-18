import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';
import { IPlayer, IUser, PlayerProperties } from '../../../interfaces/player';
import { GameEvent, IGameEvent, IModifyPlayerProperty } from '../../../interfaces/game';
import { LifeTotalComponent } from '../../life-total/life-total.component';
import { CommonModule, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { PropertyCounterComponent } from '../../property-counter/property-counter.component';
import { GameService } from '../../../services/game/game.service';
import { SetCommanderComponent } from '../../commander/set-commander/set-commander.component';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { CardIdentifierService } from '../../../services/card-identifier/card-identifier.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { environment } from '../../../../environments/environment';
import { CoinFlipperComponent } from '../../coin-flip/coin-flipper/coin-flipper.component';
import { PokemonPrizeTrackerComponent } from '../../pokemon/pokemon-prize-tracker/pokemon-prize-tracker.component';
import { ReactionsComponent } from '../../effects/reactions/reactions.component';
import { TimerComponent } from '../../timer/timer.component';

@Component({
  selector: 'app-user-stream',
  standalone: true,
  imports: [
    NgIconComponent,
    LifeTotalComponent,
    NgClass,
    NgIf,
    CommonModule,
    TitleCasePipe,
    PropertyCounterComponent,
    SetCommanderComponent,
    TooltipDirective,
    CoinFlipperComponent,
    PokemonPrizeTrackerComponent,
    ReactionsComponent,
    TimerComponent
  ],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [provideIcons({ bootstrapGearFill })]
})
export class UserStreamComponent {

  @Input() player!: IPlayer;
  @Input() isLocalStream: boolean = false;
  
  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;

  showCommanderDamage:boolean = true;

  muted:boolean = false;
  volume: number = 1;

  audioInputDevices: MediaDeviceInfo[] = [];
  videoInputDevices: MediaDeviceInfo[] = [];
  selectedAudioDeviceId: string = '';
  selectedVideoDeviceId: string = '';
  isMutedSelf: boolean = false;
  isVideoOff: boolean = false;
  loadingCardIdentification:boolean = false;

  constructor(private webRTC: WebRTCService,
    public gameService: GameService,
    private cardIdentifierService:CardIdentifierService,
    private logger:LoggerService,
    private alertService: AlertsService) {}
  

  ngAfterViewInit(){
    if(!this.isLocalStream){
      this.webRTC.subscribeToStreamAdd(this.streamAdded);
      // this.webRTC.subscribeToStreamRemove(this.streamRemoved);
      this.setStream(this.webRTC.getStream(this.player.socketId))  
      
    }else {
      
      // Local stream
      // Initialize device lists
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
        this.videoInputDevices = devices.filter((device) => device.kind === 'videoinput');

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
  }

  initLocalStream(){
    this.webRTC.initLocalStream(this.selectedVideoDeviceId, this.selectedAudioDeviceId).then(stream => {
      if (this.video.nativeElement) {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.muted = true; // Mute local video to prevent echo
      }

      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
        this.videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
      });
    })
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    if (user.id === this.player.id) {
      //this.setStream(stream);
      this.setStream(this.webRTC.getStream(this.player.socketId))
    }
  }

  streamRemoved = (id: string) => {
    if (id === this.player.socketId) {
      this.setStream(null);
    }
  }

  setStream = (stream: MediaStream | null) => {
    if (this.video.nativeElement && stream) {
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.volume = this.volume;
      this.video.nativeElement.muted = this.muted;
    }
  }

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
      });
  }

  toggleMuteSelf() {
    this.isMutedSelf = !this.isMutedSelf;
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
      remoteStream.getAudioTracks().forEach(track => track.enabled = false);
      this.muted=true;
    }
  }
  
  unmuteRemoteUser(): void {
    const remoteStream = this.webRTC.getRemoteStream(this.player.socketId);
    if (remoteStream) {
      remoteStream.getAudioTracks().forEach(track => track.enabled = true);
      this.muted=false;
    }
  }

  modifyLifeTotal = (amount:number)=>{
    let payload:IModifyPlayerProperty = {amountToModify: amount, property: PlayerProperties.lifeTotal}
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload:payload
    })
  }

  modifyPoisonTotal = (amount:number)=>{
    let payload:IModifyPlayerProperty = {amountToModify: amount, property: PlayerProperties.poisonTotal}
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload:payload
    })
  }

  modifyEnergyTotal = (amount:number)=>{
    let payload:IModifyPlayerProperty = {amountToModify: amount, property: PlayerProperties.energyTotal}
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload:payload
    })
  }

  modifyPrizeCardTotal = (amount:number)=>{
    let payload:IModifyPlayerProperty = {amountToModify: amount, property: PlayerProperties.prizeCards}
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyPlayerProperty,
      payload:payload
    })
  }

  setFlip(){
    this.video.nativeElement.style.transform = this.player.cameraFlipped ? 'scaleX(-1) scaleY(-1)' : 'scaleX(1) scaleY(1)';
  }

  toggleFlip(): void {
    this.player.cameraFlipped = !this.player.cameraFlipped;
    this.setFlip();
  }

  modifyCommanderDamage = (playerId: string, amount: number)=>{
    this.webRTC.sendGameEvent({event: GameEvent.ModifyPlayerCommanderDamage, payload: { damagingPlayer: this.gameService.getPlayerById(playerId), amount: amount}})
  }

  getModifyCommanderDamageCallback(playerId: string): (amount: number) => void {
    return (amount: number) => {
      this.modifyCommanderDamage(playerId, amount);
    };
  }

  getCommanderDamageKeys(): string[] {
    console.log(this.player.commanderDamages);
    return Object.keys(this.player.commanderDamages);
  }

  onVideoClick(event: MouseEvent) {
    if(this.loadingCardIdentification){
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
        context.scale(-1, -1);  // Flip both X and Y axis
        context.translate(-canvas.width, -canvas.height);  // Move the context back to the origin after flipping
      }

      // Draw the current frame of the video onto the canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert the canvas content to a Blob (image file)
      canvas.toBlob((blob) => {
          if (blob) {
              // Create a file from the Blob to send to the service
              const photoFile = new File([blob], 'current_frame.jpg', { type: 'image/jpeg' });

              // Send the file and normalized click position to the classification service
              this.cardIdentifierService.classifyImage(photoFile, normalizedX, normalizedY).subscribe(
                  (response:any) => {
                      if(response && response.scryfall_data){
                        this.webRTC.sendGameEvent({event:GameEvent.ShareCard, payload: {...response.scryfall_data, classificationConfidence: response.classification_confidence}});
                      }
                      this.loadingCardIdentification = false;
                  },
                  (error:any) => {
                      this.logger.error('Error classifying image:', error);
                      this.loadingCardIdentification = false;
                  }
              );
          }

          canvas.remove();
      }, 'image/jpeg',1.0);
    }
  }

}
