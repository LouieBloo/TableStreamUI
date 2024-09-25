import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';
import { IPlayer, IUser } from '../../../interfaces/player';
import { GameEvent, IModifyPlayerProperty, PlayerProperties } from '../../../interfaces/game';
import { LifeTotalComponent } from '../../life-total/life-total.component';
import { CommonModule, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { PropertyCounterComponent } from '../../property-counter/property-counter.component';
import { GameService } from '../../../services/game/game.service';
import { SetCommanderComponent } from '../../commander/set-commander/set-commander.component';

@Component({
  selector: 'app-user-stream',
  standalone: true,
  imports: [NgIconComponent,LifeTotalComponent,NgClass,NgIf,TimeAgoPipe,CommonModule,TitleCasePipe, PropertyCounterComponent, SetCommanderComponent],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [provideIcons({ bootstrapGearFill })]
})
export class UserStreamComponent {

  @Input() player!: IPlayer;
  @Input() localStream: boolean = false;
  
  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;

  showCommanderDamage:boolean = true;

  muted:boolean = false;
  volume: number = 1;

  // Device selection properties
  audioInputDevices: MediaDeviceInfo[] = [];
  videoInputDevices: MediaDeviceInfo[] = [];
  selectedAudioDeviceId: string = '';
  selectedVideoDeviceId: string = '';
  isMutedSelf: boolean = false;
  isVideoOff: boolean = false;

  constructor(private webRTC: WebRTCService, public gameService: GameService) {}
  

  ngAfterViewInit() {
    console.log("Creation init user stream")

    if(!this.localStream){
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

  initLocalStream() {
    this.webRTC.initLocalStream(this.selectedVideoDeviceId, this.selectedAudioDeviceId).then(stream => {
      if (this.video.nativeElement) {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.muted = true; // Mute local video to prevent echo
      }
    });
  }

  streamAdded = (id: string, stream: MediaStream, user: IUser) => {
    console.log("stream added: ", user)
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
      console.log('remote setting stream!');
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
    return Object.keys(this.player.commanderDamages);
  }
}
