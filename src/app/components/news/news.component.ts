import { Component } from '@angular/core';
import { NewsService } from '../../services/news/news.service';
import { IMaintenanceAlert, INews } from '../../interfaces/app';
import { LoggerService } from '../../services/logger/logger.service';
import { NgIf } from '@angular/common';
import { bootstrapXLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [NgIf, NgIcon],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
  viewProviders: [provideIcons({ bootstrapXLg })]
})
export class NewsComponent {

  activeMaintenanceAlert!: IMaintenanceAlert | null;
  seenAlerts: any = {};
  refreshTimer:any;

  hoursBeforeWarningShows: number = 3;
  refreshIntervalInMins:number = 10;

  constructor(private newsService: NewsService, private logger: LoggerService) { }

  ngOnInit() {
    this.refreshTimer = setInterval(()=>{
      this.checkNews();
    },1000 * 60 * this.refreshIntervalInMins);

    this.checkNews();
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
  }

  checkNews = async () => {
    this.newsService.getNews().subscribe({
      next: (response: INews) => {
        if (response && response.serverMaintenance) {
          this.addServiceMaintenanceAlert(response.serverMaintenance);
        }
      },
      error: (error: any) => {
        this.logger.error("Error getting server news: ", error);
      },
    });
  }

  addServiceMaintenanceAlert = (incomingServerMaintenance: IMaintenanceAlert) => {
    let startTime = new Date(incomingServerMaintenance.startTime);
    let endTime = new Date(incomingServerMaintenance.endTime);
    let now = new Date();

    //dont need to show the alert if the maintenance is over
    if (endTime <= now) {
      // console.log("End time has passed");
    } else if (now >= startTime && now < endTime) {
      // console.log("Maintenance is currently ongoing");
      if (!this.seenAlerts[incomingServerMaintenance.id]) {
        incomingServerMaintenance.message = `Server maintenance is currently ongoing and is expected to end at ${endTime}. Games might be unresponsive during this time.`;
        this.activeMaintenanceAlert = incomingServerMaintenance;
        this.activeMaintenanceAlert.severity = 'alert-error'
      }
    } else if (startTime.getTime() - now.getTime() <= this.hoursBeforeWarningShows * 60 * 60 * 1000) {
      // console.log("Close to start time");
      if (!this.seenAlerts[incomingServerMaintenance.id]) {
        incomingServerMaintenance.message = `Server maintenance scheduled at ${startTime} for 30 minutes. Games might become unresponsive during this time.`
        this.activeMaintenanceAlert = incomingServerMaintenance;
        this.activeMaintenanceAlert.severity = 'alert-warning'
      }
    }
  }

  removeAlert() {
    if (this.activeMaintenanceAlert) {
      this.seenAlerts[this.activeMaintenanceAlert.id] = true;
    }

    this.activeMaintenanceAlert = null;
  }

}
