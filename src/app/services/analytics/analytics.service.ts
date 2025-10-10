import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IAdminAnalytic } from '../../interfaces/IAdminAnalytic';
import { GameType } from '../../interfaces/IGame';
import { IHomeAnalytic } from '../../interfaces/IHomeAnalytic';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private _adminAnalytic: BehaviorSubject<IAdminAnalytic | null> =
    new BehaviorSubject<IAdminAnalytic | null>(null);

  private _homeAnalytic: BehaviorSubject<IHomeAnalytic | null> =
    new BehaviorSubject<IHomeAnalytic | null>(null);

  private _isAuthorized: boolean = false;

  get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  get isAnalyticLoaded$(): Observable<boolean> {
    return this.adminAnalytic$.pipe(map((analytic) => !!analytic));
  }

  get adminAnalytic$() {
    return this._adminAnalytic.asObservable();
  }

  get homeAnalytic$() {
    return this._homeAnalytic.asObservable();
  }

  get activePlayers$(): Observable<number> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return analytic?.redisAnalytic.activePlayers ?? 0;
      })
    );
  }

  get activeRooms$(): Observable<number> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return analytic?.redisAnalytic.activeRooms ?? 0;
      })
    );
  }

  get timeFrames$(): Observable<string[]> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        let timeframes: string[] = [];
        analytic?.mongoAnalytic.mongoAnalyticsByDate.forEach((ma) => {
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
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        let roomDurationInMinutes: number[] = [];
        analytic?.mongoAnalytic.mongoAnalyticsByDate.forEach((ma) => {
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
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        let numberOfPlayers: number[] = [];
        analytic?.mongoAnalytic.mongoAnalyticsByDate.forEach((ma) =>
          numberOfPlayers.push(ma.totalPlayers)
        );
        return numberOfPlayers;
      })
    );
  }

  get numberOfRooms$() {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        let numberOfRooms: number[] = [];
        analytic?.mongoAnalytic.mongoAnalyticsByDate.forEach((ma) =>
          numberOfRooms.push(ma.roomCount)
        );
        return numberOfRooms;
      })
    );
  }

  get totalPlayersToday$(): Observable<number | null> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return analytic?.mongoAnalytic.totalPlayersToday ?? null;
      })
    );
  }

  get totalRoomsToday$(): Observable<number | null> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return analytic?.mongoAnalytic.totalRoomsToday ?? null;
      })
    );
  }

  get numberOfRoomsPerGameType$(): Observable<number[]> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return (
          analytic?.mongoAnalytic.gameAnalytics.map(
            (gameAnalytic) => gameAnalytic.numberOfRooms
          ) ?? []
        );
      })
    );
  }

  get gameTypes$(): Observable<string[]> {
    return this.adminAnalytic$.pipe(
      map((analytic) => {
        return (
          analytic?.mongoAnalytic.gameAnalytics.map((gameAnalytic) => {
            const enumValue = GameType[gameAnalytic.gameType as keyof typeof GameType];
            return enumValue.toString();
          }) ?? []
        );
      })
    );
  }

  constructor(private http: HttpClient) {
    this.getHomeAnalytic().subscribe();
  }

  public getAnalytic(password: string): Observable<IAdminAnalytic> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${password}`,
    });
    return this.http
      .get<IAdminAnalytic>(environment.socketUrl + '/analytics', { headers })
      .pipe(
        tap((response: IAdminAnalytic) => {
          response.mongoAnalytic.mongoAnalyticsByDate.forEach((ma) => {
            ma.startDate = new Date(ma.startDate);
            ma.endDate = new Date(ma.endDate);
          });
          this._adminAnalytic.next(response);
          this._isAuthorized = true;
        })
      );
  }

  public getHomeAnalytic(): Observable<IHomeAnalytic> {
    return this.http.get<IHomeAnalytic>(environment.socketUrl + '/homeAnalytic')
    .pipe(
      tap((analytic: IHomeAnalytic)=>{
        this._homeAnalytic.next(analytic);
      })
    )
  }

}
