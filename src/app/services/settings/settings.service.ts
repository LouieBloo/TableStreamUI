import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public effectVolume:number = 0.55;
  public tokensEnabled:boolean = true;

  constructor() { }
}
