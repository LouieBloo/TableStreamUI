import { Component } from '@angular/core';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { LocalUserStreamComponent } from '../users/local-user-stream/local-user-stream.component';
import { RemoteUserStreamComponent } from '../users/remote-user-stream/remote-user-stream.component';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [LocalUserStreamComponent, RemoteUserStreamComponent, NgFor],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {

  remoteSocketIds: string[] = []

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
