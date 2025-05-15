import { NgSwitch, NgSwitchCase } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgSwitch,NgSwitchCase,RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {
  status: 'pending' | 'success' | 'error' = 'pending';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status = 'error';
      return;
    }

    this.userService.verifyEmail(token).subscribe({
      next: () => (this.status = 'success'),
      error: () => (this.status = 'error'),
    });
  }
}
