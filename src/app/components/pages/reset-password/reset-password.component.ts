import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { NgIf } from '@angular/common';
import { InputErrorComponent } from '../../forms/input-error/input-error.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgIf, InputErrorComponent,FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  token: string | null = null;
  requestingReset:boolean = true;
  success = false;
  error = '';

  resetForm!:FormGroup;
  sendResetForm!:FormGroup

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.sendResetForm = this.fb.group({
      email: ['', [Validators.email]]
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(10),Validators.maxLength(100)]],
      confirm: ['', [Validators.required]],
    });

    this.token = this.route.snapshot.queryParamMap.get('token');
    if (this.token) {
      this.requestingReset = false;
    }
  }

  onSetNewPassword() {
    this.error = '';
    this.success = false;

    const password = this.resetForm.get('password')?.value;
    const confirm = this.resetForm.get('confirm')?.value;

    if (this.resetForm.invalid || password !== confirm) {
      this.error = password !== confirm ? 'Passwords do not match' : 'Form is invalid';
      return;
    }

    this.userService.resetPassword(this.token!, password!).subscribe({
      next: () => (this.success = true),
      error: err => {
        console.error(err);
        this.error = err?.error?.message || 'Something went wrong';
      },
    });
  }

  onRequestResetPassword(){
    if (this.sendResetForm.invalid) return;
    this.error = '';
    this.success = false;

    this.userService.sendResetPasswordEmail(this.sendResetForm.get('email')?.value).subscribe({
      next: () => (this.success = true),
      error: err => {
        console.error(err);
        this.error = err?.error?.message || 'Something went wrong';
      },
    });
  }
}
