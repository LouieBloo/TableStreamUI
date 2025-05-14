import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Validators, FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { RouterModule } from '@angular/router';
import { InputErrorComponent } from '../../forms/input-error/input-error.component';
import { InputService } from '../../../services/input/input.service';
import { AlertsService } from '../../../services/alerts/alerts.service';

@Component({
  selector: 'app-user-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, InputErrorComponent],
  templateUrl: './user-login-modal.component.html',
  styleUrl: './user-login-modal.component.css'
})
export class UserLoginModalComponent {
  authMode: 'login' | 'signup' = 'login';

  loginForm!:FormGroup;
  signupForm!:FormGroup;

  showEmailVerificationMessage:boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private inputService:InputService,
    private alertService:AlertsService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(100)]],
    });
  }

  open() {
    const dialogCheckbox = document.getElementById('userLoginToggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  close() {
    const closeModalButton = document.getElementById('closeUserLoginModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  setMode(mode: 'login' | 'signup') {
    this.authMode = mode;
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.userService.login(this.loginForm.value).subscribe({
      next: res => console.log('Logged in', res),
      error: err => console.error(err)
    });
  }

  onSignup() {
    if (this.signupForm.invalid) return;

    this.inputService.clearServerErrors(this.signupForm);

    this.userService.signup(this.signupForm.value).subscribe({
      next: res => {
        this.alertService.addAlert("success","Account created successfully!")
        this.showEmailVerificationMessage = true;
      },
      error: err => {
        if (err?.error?.errors?.length) {
          this.inputService.applyServerValidationErrors(this.signupForm, err.error.errors);
        } else {
          console.error('Unexpected signup error:', err);
        }
      }
    });
  }

}
