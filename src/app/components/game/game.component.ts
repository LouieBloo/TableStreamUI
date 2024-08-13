import { Component } from '@angular/core';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { UserStreamComponent } from '../users/user-stream/user-stream.component';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ NgFor, UserStreamComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  remoteSocketIds: string[] = ["local"]

  constructor(private webRTC: WebRTCService) { }

  ngOnInit() {
    this.webRTC.subscribeToStreamAdd(this.streamAdded);
    this.webRTC.subscribeToStreamRemove(this.streamRemoved);

    this.webRTC.joinRoom();
  }

  streamAdded = (id: string) => {
    this.remoteSocketIds.push(id);
  }

  streamRemoved = (id: string) => {
    this.remoteSocketIds = this.remoteSocketIds.filter((userId) => userId !== id)
  }
}
