import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { BarGraphComponent } from '../../bar-graph/bar-graph.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { StatComponent } from '../../stat/stat.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, BarGraphComponent, NgIf ,StatComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  numberOfPlayers$: Observable<number[]> = of();
  numberOfRooms$: Observable<number[]> = of();
  timeFrames$: Observable<string[]> = of();
  roomDurationMinutes$: Observable<number[]> = of();
  activePlayers$: Observable<number> = of();
  activeRooms$: Observable<number> = of();
  isAnalyticLoaded$: Observable<boolean> = of(false);


  constructor(private analyticsService: AnalyticsService) {
    this.numberOfRooms$ = this.analyticsService.numberOfRooms$;
    this.numberOfPlayers$ = this.analyticsService.numberOfPlayers$;
    this.roomDurationMinutes$ = this.analyticsService.roomDurationMinutes$;
    this.timeFrames$ = this.analyticsService.timeFrames$.pipe(shareReplay());
    this.activePlayers$ = this.analyticsService.activePlayers$;
    this.activeRooms$ = this.analyticsService.activeRooms$;
    this.isAnalyticLoaded$ = this.analyticsService.isAnalyticLoaded$;
    
  }

}
