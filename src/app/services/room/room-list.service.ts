import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IRoom } from '../../interfaces/IRoom';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RoomListService {
  private roomsSubject = new BehaviorSubject<IRoom[] | null>(null);
  public rooms$ = this.roomsSubject.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {}

  getRooms() {
    this.http
      .get<any>(environment.socketUrl + '/rooms', {
        headers: this.userService.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          this.roomsSubject.next(res.rooms);
        })
      )
      .subscribe();
  }

}
