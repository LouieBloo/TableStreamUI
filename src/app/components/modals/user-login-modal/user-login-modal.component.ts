import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Validators, FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { Router, RouterModule } from '@angular/router';
import { InputErrorComponent } from '../../forms/input-error/input-error.component';
import { InputService } from '../../../services/input/input.service';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { Subscription } from 'rxjs';
import { UserInputAction } from '../../../interfaces/inputs';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { ProfileIconComponent } from '../../users/profile-icon/profile-icon.component';

@Component({
  selector: 'app-user-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, InputErrorComponent, ProfileIconComponent],
  templateUrl: './user-login-modal.component.html',
  styleUrl: './user-login-modal.component.css',
  viewProviders: [provideIcons({ 
    bootstrapPersonCircle,
   })]
})
export class UserLoginModalComponent {
  authMode: 'login' | 'signup' = 'login';

  loginForm!: FormGroup;
  signupForm!: FormGroup;

  showEmailVerificationMessage: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    private inputService: InputService,
    private alertService: AlertsService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.inputService.subscribe(({ action, payload }: { action: UserInputAction; payload?: any }) => {
        if (action == UserInputAction.OpenUserLogin) {
          this.open();
        }
      })
    );

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    });

    if(this.localStorageService.userEmail){
      this.loginForm.patchValue({
        email: this.localStorageService.userEmail
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

    this.inputService.clearServerErrors(this.loginForm);

    this.userService.login(this.loginForm.value).subscribe({
      next: res => {
        this.localStorageService.setUserEmail(this.loginForm.value.email);
        this.close();
      },
      error: err => {
        if (err?.error?.errors?.length) {
          this.inputService.applyServerValidationErrors(this.loginForm, err.error.errors);
        } else {
          console.error('Unexpected login error:', err);
        }
      }
    });
  }

  onSignup() {
    if (this.signupForm.invalid) return;

    this.inputService.clearServerErrors(this.signupForm);

    this.userService.signup(this.signupForm.value).subscribe({
      next: res => {
        this.alertService.addAlert("success", "Account created successfully!")
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

  onForgotPassword(){
    this.close();
    this.router.navigate(["/reset-password"])
  }

  get isGamePage(): boolean {
    return this.router.url.startsWith('/game');
  }
}
