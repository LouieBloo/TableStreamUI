import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginPayload, ISignupPayload, IUser } from '../../interfaces/IUser';
import { AlertsService } from '../alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private tokenKey = 'authToken';
  private userKey = 'user';

  user: IUser | null = null;

  constructor(private http: HttpClient, private alertService:AlertsService) {
    this.restoreSession();
  }

  login(payload: ILoginPayload): Observable<any> {
    return this.http.post<any>(environment.socketUrl +  '/users/login', payload).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        this.fetchUser();
      })
    );
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

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user = null;
    this.alertService.addAlert("warning", "You have been logged out", 2)
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private restoreSession(): void {
    if(this.isLoggedIn()){
      this.fetchUser();
    }else{
      this.logout();
    }
  }

  private fetchUser(): void {
    const token = localStorage.getItem(this.tokenKey);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    this.http.get<{ user: IUser }>(environment.socketUrl + '/users/me', {headers}).subscribe({
      next: res => {
        this.user = res.user;
        localStorage.setItem(this.userKey, JSON.stringify(this.user));
        this.alertService.addAlert("success",`Welcome ${this.user.name}!`)
      },
      error: () => {
        this.logout(); // token invalid
      }
    });
  }
}
