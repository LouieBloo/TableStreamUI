import { Component, ElementRef, ViewChild } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';

@Component({
  selector: 'app-local-user-stream',
  standalone: true,
  imports: [],
  templateUrl: './local-user-stream.component.html',
  styleUrl: './local-user-stream.component.css'
})
export class LocalUserStreamComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  
  constructor(private webRTC: WebRTCService) {}

  ngOnInit() {
    this.webRTC.initLocalStream().then(stream => {
      if (this.localVideo.nativeElement) {
        this.localVideo.nativeElement.srcObject = stream;
      }
    });
  }
}
