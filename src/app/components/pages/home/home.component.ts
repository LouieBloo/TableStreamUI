import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GAME_TYPES } from '../../../constants/game-types.constants';
import { GameType } from '../../../interfaces/game';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { IpAddressWarningModalComponent } from '../../modals/ip-address-warning-modal/ip-address-warning-modal.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgFor, IpAddressWarningModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild(IpAddressWarningModalComponent)
  ipAddressModal!: IpAddressWarningModalComponent;

  activeTab: string = 'join';
  gameTypes = GAME_TYPES;
  isCreateGame: boolean = false;
  player = {
    name: '',
    roomName: '',
    isSpectator: false,
    roomId: '',
    password: null,
    gameType: GameType.MTGCommander,
    maxPlayers: 4,
  };

  constructor(
    private router: Router,
    private webRTC: WebRTCService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const joinRoomId = this.route.snapshot.queryParamMap.get('id')!;

    if (joinRoomId) {
      this.player.roomId = joinRoomId;
    }

    this.webRTC.disconnect();
    localStorage.removeItem('roomName');
    localStorage.removeItem('gameType');
    localStorage.removeItem('maxPlayers');
    localStorage.removeItem('isSpectator');
    localStorage.removeItem('password');
    localStorage.removeItem('roomId');

    if (localStorage.getItem('playerName')) {
      this.player.name = localStorage.getItem('playerName')!;
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  onCreateGame() {
    this.isCreateGame = true;

    if (this.agreedToDisclaimer()) {
      this.setLocalStorageForCreate();
      this.router.navigate(['/game']);
      return;
    }

    this.ipAddressModal.open();
  }

  onJoinGame(): void {
    this.isCreateGame = false;

    if (this.agreedToDisclaimer()) {
      this.setLocalStorageForJoin();
      this.navigateOnJoin();
      return;
    }
    this.ipAddressModal.open();
  }

  onAgreeClicked(): void {
    if (this.isCreateGame) {
      this.setLocalStorageForCreate();
      this.router.navigate(['/game']);
    } else {
      this.setLocalStorageForJoin();
      this.navigateOnJoin();
    }
  }

  onGameTypeChange(selectedValue: string) {
    // Find the selected game type based on the selected value
    const selectedGameTypeValue = Number(selectedValue);
    const selectedGameType = GAME_TYPES.find(
      (gameType: any) => gameType.value === selectedGameTypeValue
    );

    if (selectedGameType) {
      this.player.maxPlayers = selectedGameType.defaultMaxPlayers;
    }
  }

  isValidGameType = (): boolean => {
    return this.player.gameType != GameType.YuGiOhStandard;
  };

  private agreedToDisclaimer(): boolean {
    return localStorage.getItem('agreeToDisclaimer') === 'true';
  }

  private setLocalStorageForJoin(): void {
    localStorage.setItem('playerName', this.player.name);
    localStorage.setItem('isSpectator', String(this.player.isSpectator));
  }

  private navigateOnJoin() {
    this.router.navigate(['/game'], {
      queryParams: { id: this.player.roomId },
      queryParamsHandling: 'merge',
    });
  }

  private setLocalStorageForCreate(): void {
    localStorage.setItem('playerName', this.player.name);
    localStorage.setItem('roomName', this.player.roomName);
    localStorage.setItem('gameType', this.player.gameType.toString());
    localStorage.setItem('maxPlayers', this.player.maxPlayers.toString());
    localStorage.setItem('isSpectator', 'false');
    
    if (this.player.password) {
      localStorage.setItem('password', this.player.password);
    }
  }


  get backgroundImage():string{
    if(this.player.gameType == GameType.PokemonStandard){
      return "pokemon"
    }else if(this.player.gameType == GameType.MTGCommander){
      return "magic"
    }else if(this.player.gameType == GameType.MTGLegacy){
      return "wrenn"
    }else if(this.player.gameType == GameType.MTGModern){
      return "ulamog"
    }else if(this.player.gameType == GameType.MTGStandard){
      return "rakdos"
    }else if(this.player.gameType == GameType.MTGVintage){
      return "mana-vault"
    }
        
    return "magic"
  }
}
