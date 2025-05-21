import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { NgIf } from '@angular/common';
import { InputErrorComponent } from '../../forms/input-error/input-error.component';
import { InputService } from '../../../services/input/input.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [NgIf, FormsModule, InputErrorComponent, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent {
  private subscriptions: Subscription = new Subscription();

  updateForm!: FormGroup;

  success = false;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    private inputService: InputService
  ) { }

  ngOnInit() {
    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]]
    });

    this.subscriptions.add(
      this.userService.user$
        .subscribe(user => {
          if (user?.name) {
            this.updateForm.patchValue({ name: user.name });
          }
        })
    );

  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit() {
    this.success = false;
    this.errors = [];

    if (this.updateForm.invalid) return;

    this.inputService.clearServerErrors(this.updateForm);

    this.userService.updateUser({ name: this.updateForm.value.name! }).subscribe({
      next: () => {
        this.success = true;
      },
      error: err => {
        if (err?.error?.errors?.length) {
          this.inputService.applyServerValidationErrors(this.updateForm, err.error.errors);
        } else {
          console.error('Unexpected update user error:', err);
        }
      }
    });
  }
}
