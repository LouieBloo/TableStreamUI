import { NgSwitch, NgSwitchCase } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgSwitch,NgSwitchCase],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {
  status: 'pending' | 'success' | 'error' = 'pending';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status = 'error';
      return;
    }

    this.http
      .post<{ message: string }>('/auth/verify-email', { token })
      .subscribe({
        next: () => (this.status = 'success'),
        error: () => (this.status = 'error'),
      });
  }
}
