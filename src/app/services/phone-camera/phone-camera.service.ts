import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class PhoneCameraService {
  readonly http = inject(HttpClient);
  readonly userService = inject(UserService);
  private _url: BehaviorSubject<string> = new BehaviorSubject('');

  get urlForJoinByPhone$() {
    return this._url.asObservable();
  }

  public getQrCode(
    roomId: string | null | undefined,
    playerId: string | null,
    password: string
  ): Observable<any> {
    if (roomId == null || playerId == null) return of(null);
    const body = {
      roomId: roomId,
      playerId: playerId,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${password}`,
    });
    return this.http
      .post<string>(environment.socketUrl + '/qrcodetoken', body, { headers })
      .pipe(
        tap((code: string) => {
          const url = `${environment.clientUrl}/remote-camera/${code}?roomId=${roomId}`;
          this._url.next(url);
        })
      );
  }

  public verifyToken(id: string): Observable<any> {
    return this.http.post<any>(
      environment.socketUrl + `/verifyToken/${id}`,
      {}
    );
  }

}
