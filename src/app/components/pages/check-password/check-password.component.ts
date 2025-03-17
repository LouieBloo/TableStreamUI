import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';

@Component({
  selector: 'app-check-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './check-password.component.html',
  styleUrl: './check-password.component.css'
})
export class CheckPasswordComponent  {

  password!: string;
  subscriptions: Subscription = new Subscription();

  constructor(private analyticsService: AnalyticsService, private router: Router, private localStorageService:LocalStorageService){
  }

  ngOnInit() {
    this.password = this.localStorageService.devPassword + "";
  }

  submitPassword(): void {
    this.subscriptions.add(this.analyticsService.getAnalytic(this.password).subscribe({
      next: (response) => {
        this.localStorageService.setDevPassword(this.password);
        this.router.navigate(['/dev-dashboard']);
      },
      error: (error) => {
        console.error('Error fetching analytics:', error);
      }
    }));
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

}
