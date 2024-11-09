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
        this.display = this.parse(this.date);
        this.cdr.detectChanges();
      }, 1000);
    });
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
