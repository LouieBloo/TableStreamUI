import { Component } from '@angular/core';
import { DonationBubbleComponent } from "../donation-bubble/donation-bubble.component";
import { NgFor, NgIf } from '@angular/common';
import { IDonation } from '../../../interfaces/IDonations';
import { DonationService } from '../../../services/donations/donation.service';
import { LoggerService } from '../../../services/logger/logger.service';

@Component({
  selector: 'app-recent-donation-list',
  standalone: true,
  imports: [DonationBubbleComponent, NgFor, NgIf],
  templateUrl: './recent-donation-list.component.html',
  styleUrl: './recent-donation-list.component.css'
})
export class RecentDonationListComponent {
  donations: IDonation[] = [];

  activeDonation!: any;
  currentIndex: number = 0;

  pushInterval: any;

  constructor(private donationService:DonationService, private logger:LoggerService){}

  ngOnInit() {
    this.donationService.getDonations().subscribe({
      next: (response: any) => {
        if (response && response.donations) {
          this.donations = response.donations;
          this.pushActiveDonation();
        }
      },
      error: (error: any) => {
        this.logger.error("Error getting server news: ", error);
      },
    });
  }

  ngOnDestroy(): void {
    // clearInterval(this.pushInterval);
  }

  onBubbleDeath = (donation: IDonation) => {
    this.activeDonation = null;
    setTimeout(() => {
      this.pushActiveDonation();
    }, 100);
  }

  pushActiveDonation = () => {
    if (!this.donations || this.donations.length < 1) {
      return;
    }

    this.activeDonation = this.donations[this.currentIndex];
    this.currentIndex++;

    if (this.currentIndex >= this.donations.length) {
      this.currentIndex = 0; // Loop back to start if needed
    }
  }
}
