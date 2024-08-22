import { Pipe, PipeTransform } from '@angular/core';
import { interval, map, Observable, startWith } from 'rxjs';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | number | undefined): Observable<string> {
    return interval(1000).pipe(
      startWith(0), // Ensure the pipe updates immediately
      map(() => this.parse(value))
    );
  }

  private parse(payload: Date | number | undefined){
    if(!payload){
      return "0"; 
    }

    if(typeof payload === "number"){
      return this.getTotalTime(payload);
    }else{
      return this.getTimeAgo(payload);
    }
  }

  private getTimeAgo(date: Date): string {
    const now = new Date().getTime();
    const past = new Date(date).getTime();
    const diff = now - past;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}min ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private getTotalTime(ms:number):string{
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
        return `${minutes}min ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
  }

}
