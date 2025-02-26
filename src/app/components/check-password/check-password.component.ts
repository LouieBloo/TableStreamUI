import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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

  constructor(private analyticsService: AnalyticsService, private router: Router){
  }

  submitPassword(): void {
    this.subscriptions.add(this.analyticsService.getAnalytic(this.password).subscribe({
      next: (response) => {
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
