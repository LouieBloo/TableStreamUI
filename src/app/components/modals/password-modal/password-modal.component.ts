import { AsyncPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule, NgIf, AsyncPipe],
  templateUrl: './password-modal.component.html',
  styleUrl: './password-modal.component.css'
})
export class PasswordModalComponent {
  
  @Output() joinGame: EventEmitter<any> = new EventEmitter<any>();
  @Output() goBackEvent: EventEmitter<any> = new EventEmitter<any>();

  password: string = "";
  roomPasswordValid = of<boolean|null>(null);
  
  constructor(public webRtcService: WebRTCService){
    this.roomPasswordValid = webRtcService.roomPasswordValid;
  }
  
  open() {
    const dialogCheckbox = document.getElementById('togglePasswordModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  savePassword() {
    this.joinGame.emit(this.password);
  }

  close(){
    const closeModalButton = document.getElementById('closePasswordModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  goBack(){
    this.goBackEvent.emit();
  }

  ngOnDestroy(){
    this.webRtcService.resetRoomPasswordInvalid();
  }
}
