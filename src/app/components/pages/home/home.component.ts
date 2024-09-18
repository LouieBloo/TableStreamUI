import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  activeTab: string = 'join';

  player = {
    name: '',
    roomName: '',
    isSpectator: false,
    roomId:''
  };

  constructor(private router: Router, private webRTC: WebRTCService, private route: ActivatedRoute){}

  ngOnInit() {
    let joinRoomId = this.route.snapshot.queryParamMap.get('id')!;

    if(joinRoomId){
      this.player.roomId = joinRoomId;
    }

    this.webRTC.disconnect();
    localStorage.removeItem("roomName");

    if(localStorage.getItem("playerName")){
      this.player.name = localStorage.getItem("playerName")!;
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // Handle Create Game form submission
  onCreateGame() {
    localStorage.setItem("playerName", this.player.name);
    localStorage.setItem("roomName", this.player.roomName);
    this.router.navigate(['/game']);
  }

  // Handle Join Game form submission
  onJoinGame() {
    localStorage.setItem("playerName", this.player.name);
    localStorage.setItem("isSpectator", this.player.isSpectator + "");
    this.router.navigate(['/game'], {
      queryParams: { id: this.player.roomId}, 
      queryParamsHandling: 'merge', 
    });
  }
}
