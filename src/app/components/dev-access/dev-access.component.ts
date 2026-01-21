import { Component, inject } from '@angular/core';
import { CheckPasswordComponent } from "../pages/check-password/check-password.component";
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dev-access',
  standalone: true,
  imports: [CheckPasswordComponent],
  templateUrl: './dev-access.component.html',
  styleUrl: './dev-access.component.css'
})
export class DevAccessComponent {

  analyticsService = inject(AnalyticsService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);
  subscriptions: Subscription = new Subscription();

  getAnalytic(password: string){
    this.subscriptions.add(this.analyticsService.getAnalytic(password).subscribe({
      next: (response) => {
        this.localStorageService.setDevPassword(password);
        this.router.navigate(['/dev-dashboard']);
      },
      error: (error) => {
        console.error('Error fetching analytics:', error);
      }
    }));
  }

}
