import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {

  constructor(private http: HttpClient) {}

  getIceServerList =  async () => {
    const response = await firstValueFrom(this.getTwilioIceServerList());
    return response.servers;
  };

  getTwilioIceServerList(): Observable<any> {
    return this.http.get<any>(environment.socketUrl + "/turn-id");
  }
}
