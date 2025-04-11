import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GAME_TYPES } from '../../../constants/game-types.constants';
import { GameType } from '../../../interfaces/IGame';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { IpAddressWarningModalComponent } from '../../modals/ip-address-warning-modal/ip-address-warning-modal.component';
import { PrivacyPolicyModalComponent } from '../../modals/privacy-policy-modal/privacy-policy-modal.component';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { MainLogoComponent } from "../../main-logo/main-logo.component";
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgFor, IpAddressWarningModalComponent, PrivacyPolicyModalComponent, MainLogoComponent, MainLogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild(IpAddressWarningModalComponent)
  ipAddressModal!: IpAddressWarningModalComponent;

  @ViewChild(PrivacyPolicyModalComponent)
  privacyPolicyModal!: PrivacyPolicyModalComponent;

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
    reactionsEnabled: true
  };

  constructor(
    private router: Router,
    private webRTC: WebRTCService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    const joinRoomId = this.route.snapshot.queryParamMap.get('id')!;

    if (joinRoomId) {
      this.player.roomId = joinRoomId;
    }

    this.webRTC.disconnect();
    this.localStorageService.removeStorageOnHomeLoad();
    this.localStorageService.setUserInteractedWithSite(true);

    if (this.localStorageService.playerName) {
      this.player.name = this.localStorageService.playerName!;
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  onCreateGame() {
    this.isCreateGame = true;

    if (this.localStorageService.agreedToDisclaimer === 'true') {
      this.localStorageService.setLocalStorageForCreateGame(this.player);
      this.router.navigate(['/game']);
      return;
    }

    //this.ipAddressModal.open();
    this.onAgreeClicked();
  }

  onJoinGame(): void {
    this.isCreateGame = false;

    if (this.localStorageService.agreedToDisclaimer === 'true') {
      this.setLocalStorageForJoin();
      this.navigateOnJoin();
      return;
    }
    //this.ipAddressModal.open();
    this.onAgreeClicked();
  }

  onAgreeClicked(): void {
    if (this.isCreateGame) {
      this.localStorageService.setLocalStorageForCreateGame(this.player);
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

  private setLocalStorageForJoin(): void {
    this.localStorageService.setPlayerName(this.player.name);
    this.localStorageService.setIsSpectator(this.player.isSpectator.toString())
  }

  private navigateOnJoin() {
    this.router.navigate(['/game'], {
      queryParams: { id: this.player.roomId },
      queryParamsHandling: 'merge',
    });
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
    }else if(this.player.gameType == GameType.MTGPauperCommander){
      return "pauper"
    }else if(this.player.gameType == GameType.YugiohStandard){
      return "yugioh"
    }
        
    return "magic"
  }
}
