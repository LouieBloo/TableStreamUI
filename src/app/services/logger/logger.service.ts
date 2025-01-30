import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ILog } from '../../interfaces/game';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private http: HttpClient) { }

  public error(message: string, ...args: any[]) {
    console.error(message, args)
    if (environment.production && (args && args.length > 1)) {
      args[0].browser = navigator.userAgent;
      if(args[0].error){
        args[0].error = this.parseJSError(args[0].error)
      }
      this.sendToServer({
        message: message,
        data: args && args.length > 0 ? args[0] : null,
        severity: "ERROR",
        source: args && args.length > 1 ? args[1] : "Unknown",
        application: "TABLE_STREAM_FRONT_END"
      })
    }
  }

  public log(message: string, ...args: any[]) {
    if (environment.production) {
      return;
    }
    console.log(message, args);
  }

  sendToServer(log: ILog) {
    try {
      this.http.post<ILog>(`${environment.socketUrl}/log`, log).subscribe({
        error: (error) => console.log("Error logging log: ", error)
      });
    } catch (error) {
      console.log("Error logging: ", error);
    }
  }

  parseJSError(error:any):any{
    if(!error){return {}}
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }
}
