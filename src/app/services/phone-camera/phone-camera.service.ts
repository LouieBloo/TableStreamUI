import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhoneCameraService {
  readonly http = inject(HttpClient);

  private _qrcode: BehaviorSubject<string> = new BehaviorSubject('');

  get qrCode$() {
    return this._qrcode.asObservable();
  }

  constructor() {
    this.getQrCode().subscribe();
  }

  public getQrCode(): Observable<any> {
    return this.http.get<string>(environment.socketUrl + '/qrcodetoken').pipe(
      tap((code: string) => {
        this._qrcode.next(code);
      })
    );
  }

  public verifyToken(id: string): Observable<any> {
    return this.http.post<any>(environment.socketUrl + `/verifyToken/${id}`, {})
  }
}
