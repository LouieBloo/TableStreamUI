import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './password-modal.component.html',
  styleUrl: './password-modal.component.css'
})
export class PasswordModalComponent {
  
  onSaveCallback: (password: string) => void = () => {};

  data = {
    password: ""
  }

  constructor() { }

  open = (callback: (password: string) => void) => {
    this.onSaveCallback = callback;
    const dialogCheckbox = document.getElementById('togglePasswordModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  savePassword() {
    this.onSaveCallback(this.data.password);
    const closeModalButton = document.getElementById('closePasswordModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }
}
