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
import { RecentDonationListComponent } from "../../donations/recent-donation-list/recent-donation-list.component";
import { DonationButtonComponent } from '../../donations/donation-button/donation-button.component';
import { DonationModalComponent } from '../../modals/donation-modal/donation-modal.component';
import { UserLoginModalComponent } from '../../modals/user-login-modal/user-login-modal.component';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user/user.service';
import { IRoom } from '../../../interfaces/IRoom';
import { RoomListComponent } from '../../room-list/room-list.component';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    NgFor,
    IpAddressWarningModalComponent,
    PrivacyPolicyModalComponent,
    MainLogoComponent,
    MainLogoComponent,
    RecentDonationListComponent,
    DonationButtonComponent,
    DonationModalComponent,
    RoomListComponent,
    TooltipDirective,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild(IpAddressWarningModalComponent)
  ipAddressModal!: IpAddressWarningModalComponent;

  @ViewChild(PrivacyPolicyModalComponent)
  privacyPolicyModal!: PrivacyPolicyModalComponent;

  @ViewChild(DonationModalComponent) donationModal!: DonationModalComponent;

  @ViewChild(UserLoginModalComponent) userLoginModal!: UserLoginModalComponent;

  private subscriptions: Subscription = new Subscription();

  activeTab: string = 'join';
  gameTypes = GAME_TYPES;
  isCreateGame: boolean = false;
  showRoomList: boolean = true;
  player = {
    name: '',
    roomName: '',
    isSpectator: false,
    public: false,
    roomId: '',
    password: null,
    gameType: GameType.MTGCommander,
    maxPlayers: 4,
    reactionsEnabled: true,
    allowSpectators: false
  };

  constructor(
    private router: Router,
    private webRTC: WebRTCService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public userService:UserService
  ) { }

  ngOnInit() {
    const joinRoomId = this.route.snapshot.queryParamMap.get('id')!;

    if (joinRoomId) {
      this.setJoinRoomId(joinRoomId);
    }

    this.webRTC.disconnect();
    this.localStorageService.removeStorageOnHomeLoad();
    this.localStorageService.setUserInteractedWithSite(true);

    this.loadInitialValues();

    //when the user changes we should update our name (if its been set in localstorage)
    //also update any form configs
    this.subscriptions.add(
      this.userService.user$
        .subscribe(user => {
          this.loadInitialValues();

          if(!this.userService.isLoggedIn){
            this.player.public = false;
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInitialValues() {
    if (this.localStorageService.playerName) {
      this.player.name = this.localStorageService.playerName!;
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  setJoinRoomId = (roomId:string)=>{
    this.setTab('join')
    this.player.roomId = roomId;
    this.showRoomList = false;
  }

  publicToggled = ()=>{
    if(!this.player.public){
      this.player.allowSpectators = false;

      if(this.userService.isLoggedIn){
        this.player.name = this.userService.user?.name + "";
      }
    }
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

  onRoomClick = (room:IRoom)=>{
    this.setJoinRoomId(room.id + "");
  }

  onCreateGameButtonClicked = ()=>{
    this.setTab('create')
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

  get backgroundImage(): string {
    if (this.player.gameType == GameType.PokemonStandard) {
      return "pokemon"
    } else if (this.player.gameType == GameType.MTGCommander) {
      return "magic"
    } else if (this.player.gameType == GameType.MTGLegacy) {
      return "wrenn"
    } else if (this.player.gameType == GameType.MTGModern) {
      return "ulamog"
    } else if (this.player.gameType == GameType.MTGStandard) {
      return "rakdos"
    } else if (this.player.gameType == GameType.MTGVintage) {
      return "mana-vault"
    } else if (this.player.gameType == GameType.MTGPauperCommander) {
      return "pauper"
    } else if (this.player.gameType == GameType.OnePiece) {
      return "one-piece"
    } else if (this.player.gameType == GameType.YugiohStandard) {
      return "yugioh"
    } else if(this.player.gameType == GameType.YugiohDomain){
      return "yugioh-domain"
    }

    return "magic"
  }

  openDonationModel = () => {
    this.donationModal.open();
  }

  openUserModal = () => {
    this.userLoginModal.open();
  }

  get showTermsOfService(): boolean{
    return !this.showRoomList || this.activeTab == 'create'
  }
}
