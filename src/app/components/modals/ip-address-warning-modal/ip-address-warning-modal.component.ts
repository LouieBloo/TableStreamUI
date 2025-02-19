import { Component, EventEmitter, Output } from '@angular/core';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';

@Component({
  selector: 'app-ip-address-warning-modal',
  standalone: true,
  imports: [],
  templateUrl: './ip-address-warning-modal.component.html',
  styleUrl: './ip-address-warning-modal.component.css'
})
export class IpAddressWarningModalComponent {
  constructor(private localStorageService: LocalStorageService){}

  @Output() agreeClicked: EventEmitter<any> = new EventEmitter<any>();

  open(){
    const dialogCheckbox = document.getElementById('toggleIpAddressWarningModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  iAgree(){
    this.localStorageService.setDisclaimer("true");
    this.agreeClicked.emit();
  }

}
