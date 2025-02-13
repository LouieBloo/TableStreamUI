import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy-modal',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy-modal.component.html',
  styleUrl: './privacy-policy-modal.component.css'
})
export class PrivacyPolicyModalComponent {

  constructor(){
  }

  ngOnDestroy(): void {
  }

  open() {
    const dialogCheckbox = document.getElementById('privacyPolicyToggle');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  close(){
    const closeModalButton = document.getElementById('closePrivacyPolicy');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }
}
