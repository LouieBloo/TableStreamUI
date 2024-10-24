import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.css'
})
export class ReportModalComponent {

  report = {
    title: "",
    body: "",
    email: null
  }

  loading:boolean = false;
  acceptedKnownBugs:boolean = false;

  constructor(private http:HttpClient, private alertService:AlertsService, private logger: LoggerService){}

  open = ()=>{
    const dialogCheckbox = document.getElementById('toggleReportModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  submitIssue() {
    this.loading = true;
    this.http.post(environment.socketUrl + '/report-issue', this.report).subscribe(
      (response) => {
        this.alertService.addAlert("success","Report successfully submitted. Thank you.");
        //close modal
        const closeModalButton = document.getElementById('closeReportModal');
        if (closeModalButton) {
          closeModalButton.click();
        }

        this.loading=false;
      },
      (error) => {
        this.logger.error('Error submitting issue:', error)
        alert('Failed to submit issue.');
        this.loading=false;
      }
    );
  }
}
