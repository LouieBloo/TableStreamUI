import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';

@Component({
  selector: 'app-remote-user-stream',
  standalone: true,
  imports: [],
  templateUrl: './remote-user-stream.component.html',
  styleUrl: './remote-user-stream.component.css'
})
export class RemoteUserStreamComponent {
  @Input() socketId!: string;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private stream: MediaStream | null = null;

  constructor(
    private webRTC: WebRTCService,
  ) { }

  ngAfterViewInit() {
    this.webRTC.subscribeToStreamAdd(this.streamAdded);
    this.webRTC.subscribeToStreamRemove(this.streamRemoved);

    this.setStream(this.webRTC.getStream(this.socketId))
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
    this.stream = stream;
    if (this.remoteVideo.nativeElement && stream) {
      console.log("remote setting steram!");
      this.remoteVideo.nativeElement.srcObject = stream;
    }
  }


}
