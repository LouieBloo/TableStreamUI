import { Component } from '@angular/core';

@Component({
  selector: 'app-donation-modal',
  standalone: true,
  imports: [],
  templateUrl: './donation-modal.component.html',
  styleUrl: './donation-modal.component.css'
})
export class DonationModalComponent {

  constructor() {
  }

  ngOnDestroy(): void {
  }

  open() {
    const dialogCheckbox = document.getElementById('donationToggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  close() {
    const closeModalButton = document.getElementById('closeDonationModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }
}
