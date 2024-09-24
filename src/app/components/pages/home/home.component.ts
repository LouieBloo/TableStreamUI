import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { GameType } from '../../../interfaces/game';
import { GameService } from '../../../services/game/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  activeTab: string = 'join';

  player = {
    name: '',
    roomName: '',
    isSpectator: false,
    roomId:'',
    password: null,
    gameType: GameType.MTGCommander
  };

  constructor(private router: Router, private webRTC: WebRTCService, private route: ActivatedRoute, private gameService: GameService){}

  ngOnInit() {
    let joinRoomId = this.route.snapshot.queryParamMap.get('id')!;

    if(joinRoomId){
      this.player.roomId = joinRoomId;
    }

    this.webRTC.disconnect();
    localStorage.removeItem("roomName");
    localStorage.removeItem("gameType");
    localStorage.removeItem("isSpectator");
    localStorage.removeItem("password");

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
    localStorage.setItem("gameType", this.player.gameType.toString());
    localStorage.setItem("isSpectator", 'false');
    if(this.player.password){
      localStorage.setItem("password", this.player.password);
    }
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

  gameTypes = ()=>{
    return [{
      value: GameType.MTGCommander,
      label: "MTG Commander"
    },{
      value: GameType.MTGLegacy,
      label: "MTG Legacy"
    },{
      value: GameType.MTGModern,
      label: "MTG Modern"
    },{
      value: GameType.MTGStandard,
      label: "MTG Standard"
    },{
      value: GameType.MTGVintage,
      label: "MTG Vintage"
    }]
  }
}
