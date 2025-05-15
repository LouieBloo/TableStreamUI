import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginPayload, ISignupPayload } from '../../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  login(payload: ILoginPayload): Observable<any> {
    return this.http.post(environment.socketUrl + '/users/login', payload);
  }

  signup(payload: ISignupPayload): Observable<any> {
    return this.http.post(environment.socketUrl + '/users/signup', payload);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(environment.socketUrl + '/users/verify-email', { token });
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.post(environment.socketUrl + '/users/request-password-reset', {
      email,
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(environment.socketUrl + '/users/reset-password', {
      token,
      password,
    });
  }
}
