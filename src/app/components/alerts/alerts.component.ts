import { Component } from '@angular/core';
import { AlertsService } from '../../services/alerts/alerts.service';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [NgClass,NgFor],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent {
  constructor(public alertService: AlertsService) {}
}
