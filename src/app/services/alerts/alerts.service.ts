import { Injectable } from '@angular/core';
import { IAlert } from '../../interfaces/game';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  alerts: IAlert[] = [];
  private nextId = 0;

  getAlerts(): IAlert[] {
    return this.alerts;
  }

  addAlert(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    const alert: IAlert = { type, message, id: this.nextId++ };
    this.alerts.push(alert);

    // Automatically remove the alert after 5 seconds
    setTimeout(() => {
      this.removeAlert(alert.id);
    }, 3000);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

}
