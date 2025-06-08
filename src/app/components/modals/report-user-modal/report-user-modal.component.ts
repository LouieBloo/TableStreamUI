import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IReportUserPayload } from '../../../interfaces/IUser';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent } from '../../../interfaces/IGame';

@Component({
  selector: 'app-report-user-modal',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './report-user-modal.component.html',
  styleUrl: './report-user-modal.component.css'
})
export class ReportUserModalComponent {
  reportingUser:boolean  = false;
  reportForm!: FormGroup;
  submitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private alertService: AlertsService, 
    private logger: LoggerService,
    private webRTC:WebRTCService
  ) { }

  open = (offenderPlayerId: string, roomId: string) => {
    const dialogCheckbox = document.getElementById('toggleReportUserModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }

    this.reportForm.patchValue({
      offenderPlayerId: offenderPlayerId,
      roomId: roomId
    });
  }

  close() {
    const closeModalButton = document.getElementById('closeReportUserModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      offenderPlayerId: ['', Validators.required],
      reason: ['', Validators.required],
      roomId: ['', Validators.required],
      notes: ['']
    });
  }

  kickPlayer = () => {
    this.webRTC.sendGameEvent({
      event: GameEvent.KickPlayer,
      payload: {
        playerId: this.reportForm.value.offenderPlayerId,
      },
    });
  }

  onSubmit(): void {

    if(!this.reportingUser){
      this.kickPlayer();
      this.close();
      return;
    }

    if (this.reportForm.invalid) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }
    

    this.submitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload: IReportUserPayload = this.reportForm.value;

    this.userService.reportUser(payload).subscribe({
      next: () => {
        this.alertService.addAlert('success', 'Report submitted successfully.')
        this.kickPlayer();
        this.reportForm.reset();
        this.close();
      },
      error: (error) => {
        console.error('Error reporting user:', error);
        this.errorMessage = 'Failed to submit the report. Please try again.';
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
