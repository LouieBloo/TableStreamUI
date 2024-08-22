import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';
import { IPlayer } from '../../../interfaces/player';
import { GameEvent, IModifyPlayerLifeTotal } from '../../../interfaces/game';
import { LifeTotalComponent } from '../../life-total/life-total.component';
import { CommonModule, NgClass, TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-user-stream',
  standalone: true,
  imports: [NgIconComponent,LifeTotalComponent,NgClass,TimeAgoPipe,CommonModule,TitleCasePipe],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [provideIcons({ bootstrapGearFill })]
})
export class UserStreamComponent {

  @Input() player!: IPlayer;
  @Input() localStream: boolean = false;
  
  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;

  constructor(private webRTC: WebRTCService) {}
  

  ngAfterViewInit() {
    console.log("Creation init user stream")

    if(!this.localStream){
      this.webRTC.subscribeToStreamAdd(this.streamAdded);
      // this.webRTC.subscribeToStreamRemove(this.streamRemoved);
  
      this.setStream(this.webRTC.getStream(this.player.socketId))
    }else{
      this.initLocalStream();
    }
    
    this.setFlip();
  }

  initLocalStream() {
    this.webRTC.initLocalStream().then(stream => {
      if (this.video.nativeElement) {
        this.video.nativeElement.srcObject = stream;
      }
    });
  }

  streamAdded = (id: string, stream: MediaStream, player: IPlayer) => {
    console.log("stream added: ", player)
    if (player.id === this.player.id) {
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
      console.log("remote setting steram!");
      this.video.nativeElement.srcObject = stream;
    }
  }

  modifyLifeTotal = (amount:number)=>{
    let payload:IModifyPlayerLifeTotal = {amountToModify: amount}
    this.webRTC.sendGameEvent({
      event: GameEvent.ModifyLifeTotal,
      payload:payload
    })
  }

  setFlip(){
    this.video.nativeElement.style.transform = this.player.cameraFlipped ? 'scaleY(-1)' : 'scaleY(1)';
  }

  toggleFlip(): void {
    this.player.cameraFlipped = !this.player.cameraFlipped;
    this.setFlip();
  }
}
