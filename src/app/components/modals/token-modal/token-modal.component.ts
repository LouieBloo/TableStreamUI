import { Component } from '@angular/core';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent } from '../../../interfaces/IGame';
import { SettingsService } from '../../../services/settings/settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-token-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './token-modal.component.html',
  styleUrl: './token-modal.component.css'
})
export class TokenModalComponent {

 constructor(private webRTC:WebRTCService, public settingService:SettingsService){
 }

 ngOnDestroy(): void {
 }

 open() {
   const dialogCheckbox = document.getElementById('tokenToggleModal');
   if (dialogCheckbox) {
     dialogCheckbox.click();
   }
 }

 close(){
   const closeModalButton = document.getElementById('closeTokenModal');
   if (closeModalButton) {
     closeModalButton.click();
   }
 }

 createToken = ()=>{
    this.webRTC.sendGameEvent({
      event: GameEvent.CreateToken
    })

    this.close();
  }
 
}
