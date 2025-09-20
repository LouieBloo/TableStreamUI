import { Component } from '@angular/core';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { IHomeAnalytic } from '../../interfaces/IHomeAnalytic';
import { Observable, of } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-home-analytic',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './home-analytic.component.html',
  styleUrl: './home-analytic.component.css'
})
export class HomeAnalyticComponent {

  homeAnalytic$: Observable<IHomeAnalytic|null> = of();

  constructor(analyticsService: AnalyticsService){
    this.homeAnalytic$ = analyticsService.homeAnalytic$;
  }
}
