import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  public error(message: string, ...args: any[]){
    console.error(message, args)
  }

  public log(message: string, ...args: any[]){
    if(environment.production){
      return;
    }
    console.log(message, args);
  }
  
}
