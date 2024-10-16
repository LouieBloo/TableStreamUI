import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ip-address-warning-modal',
  standalone: true,
  imports: [],
  templateUrl: './ip-address-warning-modal.component.html',
  styleUrl: './ip-address-warning-modal.component.css'
})
export class IpAddressWarningModalComponent {

  @Output() agreeClicked: EventEmitter<any> = new EventEmitter<any>();

  open(){
    const dialogCheckbox = document.getElementById('toggleIpAddressWarningModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  iAgree(){
    localStorage.setItem("agreeToDisclaimer", 'true');
    this.agreeClicked.emit();
  }

}
