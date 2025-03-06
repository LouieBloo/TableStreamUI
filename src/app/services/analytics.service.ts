import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAnalytic } from '../interfaces/IAnalytic';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private _analytic: BehaviorSubject<IAnalytic | null> =
    new BehaviorSubject<IAnalytic | null>(null);

  private _isAuthorized: boolean = false;

  get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  get isAnalyticLoaded$(): Observable<boolean> {
    return this.analytic$.pipe(map((analytic) => !!analytic));
  }

  get analytic$() {
    return this._analytic.asObservable();
  }

  get activePlayers$(): Observable<number> {
    return this.analytic$.pipe(
      map((analytic) => {
        return analytic?.redisAnalytic.activePlayers ?? 0;
      })
    );
  }

  get activeRooms$(): Observable<number> {
    return this.analytic$.pipe(
      map((analytic) => {
        return analytic?.redisAnalytic.activeRooms ?? 0;
      })
    );
  }

  get timeFrames$(): Observable<string[]> {
    return this.analytic$.pipe(
      map((analytic) => {
        let timeframes: string[] = [];
        analytic?.mongoAnalytics.forEach((ma) => {
          const startDate = ma.startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const endDate = ma.endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const dateString = `${startDate} - ${endDate}`;
          timeframes.push(dateString);
        });
        return timeframes;
      })
    );
  }

  get roomDurationMinutes$(): Observable<number[]> {
    return this.analytic$.pipe(
      map((analytic) => {
        let roomDurationInMinutes: number[] = [];
        analytic?.mongoAnalytics.forEach((ma) => {
          const formattedDuration = parseFloat(
            ma.averageRoomDurationInMinutes.toFixed()
          );
          roomDurationInMinutes.push(formattedDuration);
        });
        return roomDurationInMinutes;
      })
    );
  }

  get numberOfPlayers$(): Observable<number[]> {
    return this.analytic$.pipe(
      map((analytic) => {
        let numberOfPlayers: number[] = [];
        analytic?.mongoAnalytics.forEach((ma) =>
          numberOfPlayers.push(ma.totalPlayers)
        );
        return numberOfPlayers;
      })
    );
  }

  get numberOfRooms$() {
    return this.analytic$.pipe(
      map((analytic) => {
        let numberOfPlayers: number[] = [];
        analytic?.mongoAnalytics.forEach((ma) =>
          numberOfPlayers.push(ma.totalPlayers)
        );
        return numberOfPlayers;
      })
    );
  }

  constructor(private http: HttpClient) {}

  public getAnalytic(password: string): Observable<IAnalytic> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${password}`,
    });
    return this.http
      .get<IAnalytic>(environment.socketUrl + '/analytics', { headers })
      .pipe(
        tap((response: IAnalytic) => {
          response.mongoAnalytics.forEach((ma) => {
            ma.startDate = new Date(ma.startDate);
            ma.endDate = new Date(ma.endDate);
          });
          this._analytic.next(response);
          this._isAuthorized = true;
        })
      );
  }
}
