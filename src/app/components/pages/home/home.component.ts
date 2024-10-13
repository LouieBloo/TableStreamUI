import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    gameType: GameType.MTGCommander,
    maxPlayers: 4
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
    localStorage.removeItem("maxPlayers");
    localStorage.removeItem("isSpectator");
    localStorage.removeItem("password");
    localStorage.removeItem('roomId')

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
    localStorage.setItem("maxPlayers", this.player.maxPlayers.toString());
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
      label: "MTG Commander",
      defaultMaxPlayers: 4
    },{
      value: GameType.MTGLegacy,
      label: "MTG Legacy",
      defaultMaxPlayers: 2
    },{
      value: GameType.MTGModern,
      label: "MTG Modern",
      defaultMaxPlayers: 2
    },{
      value: GameType.MTGStandard,
      label: "MTG Standard",
      defaultMaxPlayers: 2
    },{
      value: GameType.MTGVintage,
      label: "MTG Vintage",
      defaultMaxPlayers: 2
    },{
      value: GameType.PokemonStandard,
      label: "Pokémon (coming soon)",
      defaultMaxPlayers: 2
    },{
      value: GameType.PokemonStandard,
      label: "Yu-Gi-Oh! (coming soon)",
      defaultMaxPlayers: 2
    }]
  }

  onGameTypeChange(selectedValue: string) {
    // Find the selected game type based on the selected value
    const selectedGameTypeValue = Number(selectedValue);
    const selectedGameType = this.gameTypes().find((gameType:any) => gameType.value === selectedGameTypeValue);
  
    if (selectedGameType) {
      this.player.maxPlayers = selectedGameType.defaultMaxPlayers;
    } 
  }

  isValidGameType = ():boolean=>{
    return this.player.gameType != GameType.PokemonStandard;
  }
}
