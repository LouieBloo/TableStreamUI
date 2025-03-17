import { Injectable } from '@angular/core';
import { IAlert } from '../../interfaces/IGame';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  alerts: IAlert[] = [];
  private nextId = 0;

  getAlerts(): IAlert[] {
    return this.alerts;
  }

  addAlert(type: 'success' | 'error' | 'info' | 'warning', message: string, timeoutInSeconds:number = 3) {
    const alert: IAlert = { type, message, id: this.nextId++ };
    this.alerts.push(alert);

    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
      this.removeAlert(alert.id);
    }, timeoutInSeconds * 1000);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

}
