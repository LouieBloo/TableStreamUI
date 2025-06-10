import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  @Input() date:any;
  @Input() countDown: boolean = false;

  display!:string;
  interval:any;

  constructor(private ngZone:NgZone,private cdr:ChangeDetectorRef){
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  startTimer(){
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.display = this.parse(this.date, this.countDown);
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  private parse(payload: Date | number | undefined, countDown: boolean){
    if(!payload){
      return "0"; 
    }

    if(typeof payload === "number"){
      return this.getTotalTime(payload);
    }else{
      return this.getTime(payload, countDown); 
    }
  }

  private getTime(date: Date, countDown:boolean): string {
    const now = new Date().getTime();
    const target = new Date(date).getTime();
    const diff = countDown ? (target - now) : (now - target);

     if (diff <= 0) {
      return "0s";
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
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
