import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class PhoneCameraService {
  readonly http = inject(HttpClient);
  readonly userService = inject(UserService);
  private _qrcode: BehaviorSubject<string> = new BehaviorSubject('');

  get qrCode$() {
    return this._qrcode.asObservable();
  }

  constructor() {}

  public getQrCode(
    roomId: string | null | undefined,
    playerId: string | null
  ): Observable<any> {
    debugger;

    if (roomId == null || playerId == null) return of(null);
    const body = {
      roomId: roomId,
      playerId: playerId,
    };
    return this.http
      .post<string>(environment.socketUrl + '/qrcodetoken', body)
      .pipe(
        tap((code: string) => {
          this._qrcode.next(code);
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
