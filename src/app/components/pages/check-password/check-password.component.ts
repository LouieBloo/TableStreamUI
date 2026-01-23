import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics/analytics.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';

@Component({
  selector: 'app-check-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './check-password.component.html',
  styleUrl: './check-password.component.css'
})
export class CheckPasswordComponent  {

  @Output() passwordOutput: EventEmitter<string> = new EventEmitter<string>();

  localStorageService = inject(LocalStorageService)
  password!: string;

  ngOnInit() {
    this.password = this.localStorageService.devPassword + "";
  }

  submitPassword(){
    this.passwordOutput.emit(this.password);
  }


}
