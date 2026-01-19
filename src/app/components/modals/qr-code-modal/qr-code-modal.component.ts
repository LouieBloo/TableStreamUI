import { Component, Input } from '@angular/core';
import { QrCodeComponent } from '../../qr-code/qr-code.component';
import { IPlayer } from '../../../interfaces/IPlayer';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [QrCodeComponent, NgIf],
  templateUrl: './qr-code-modal.component.html',
  styleUrl: './qr-code-modal.component.css',
})
export class QrCodeModalComponent {
  @Input() player: IPlayer | null | undefined = null;

  open() {
    const dialogCheckbox = document.getElementById('toggleqrCodeModalOpen');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  close() {
    const closeModalButton = document.getElementById('closeGameLog');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }
}
