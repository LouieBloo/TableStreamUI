import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IDonation } from '../../interfaces/IDonations';

@Injectable({
  providedIn: 'root'
})
export class DonationService {


  constructor(private http: HttpClient) { }
  
  public getDonations(): Observable<IDonation[]>{
    return this.http.get<IDonation[]>(environment.socketUrl + '/donations')
  }
}
