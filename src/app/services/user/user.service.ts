import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subscription, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginPayload, ISignupPayload, IUser } from '../../interfaces/IUser';
import { AlertsService } from '../alerts/alerts.service';
import { jwtDecode, JwtPayload } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private tokenKey = 'authToken';
  private userKey = 'user';
  private logoutTimer: any = null;
  private focusSub!: Subscription;

  user: IUser | null = null;

  constructor(private http: HttpClient, private alertService:AlertsService) {
    this.restoreSession();
    this.focusSub = fromEvent(window, 'focus').subscribe(() => this.checkTokenValidity());
  }

  ngOnDestroy() {
    this.focusSub.unsubscribe();
    this.clearLogoutTimer();
  }

  login(payload: ILoginPayload): Observable<any> {
    return this.http.post<any>(environment.socketUrl +  '/users/login', payload).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        this.scheduleAutoLogout(res.token);
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
    this.clearLogoutTimer();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user = null;
    this.alertService.addAlert("warning", "You have been logged out", 2)
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      if (this.isTokenExpired(token)) {
        this.logout();
      } else {
        this.scheduleAutoLogout(token);
        this.fetchUser();
      }
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

  /** Decode the JWT and schedule a logout at `exp` */
  private scheduleAutoLogout(token: string): void {
    this.clearLogoutTimer();

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode(token);
    } catch {
      return this.logout();
    }

    const expiresAt = decoded.exp ? decoded.exp * 1000 : 0;           // ms
    const now       = Date.now();
    const delay     = expiresAt - now;

    if (delay <= 0) {
      // already expired
      return this.logout();
    }

    // schedule single logout
    this.logoutTimer = setTimeout(() => this.logout(), delay);
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  /** Called on window focus — immediately check expiry */
  private checkTokenValidity(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token && this.isTokenExpired(token)) {
      this.logout();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode(token);
      return Date.now() >= (exp ? exp * 1000 : 0);
    } catch {
      return true;
    }
  }
}
