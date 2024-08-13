import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapGearFill } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-user-stream',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './user-stream.component.html',
  styleUrl: './user-stream.component.css',
  viewProviders: [provideIcons({ bootstrapGearFill })]
})
export class UserStreamComponent {

  @Input() socketId!: string;
  @Input() localStream: boolean = false;
  
  @ViewChild('videoElement') video!: ElementRef<HTMLVideoElement>;

  isFlipped: boolean = false;

  constructor(private webRTC: WebRTCService) {}
  

  ngAfterViewInit() {
    console.log("Creation init user stream")

    if(!this.localStream){
      this.webRTC.subscribeToStreamAdd(this.streamAdded);
      this.webRTC.subscribeToStreamRemove(this.streamRemoved);
  
      this.setStream(this.webRTC.getStream(this.socketId))
    }else{
      this.initLocalStream();
    }
    
  }

  initLocalStream() {
    this.webRTC.initLocalStream().then(stream => {
      if (this.video.nativeElement) {
        this.video.nativeElement.srcObject = stream;
      }
    });
  }

  streamAdded = (id: string, stream: MediaStream) => {
    console.log("stream added: ", id)
    if (id === this.socketId) {
      this.setStream(stream);
    }
  }

  streamRemoved = (id: string) => {
    if (id === this.socketId) {
      this.setStream(null);
    }
  }

  setStream = (stream: MediaStream | null) => {
    if (this.video.nativeElement && stream) {
      console.log("remote setting steram!");
      this.video.nativeElement.srcObject = stream;
    }
  }

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
    this.video.nativeElement.style.transform = this.isFlipped ? 'scaleY(-1)' : 'scaleY(1)';
  }
}
