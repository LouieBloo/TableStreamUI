import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameAxeSword, gameCoffeeCup} from '@ng-icons/game-icons';
import { MainLogoComponent } from '../../main-logo/main-logo.component';
import { DonationModalComponent } from '../../modals/donation-modal/donation-modal.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink,NgIcon, MainLogoComponent, DonationModalComponent,NgIf],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  viewProviders: [provideIcons({ bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill, gameAxeSword, gameCoffeeCup })]
})
export class IndexComponent {
  @ViewChild(DonationModalComponent) donationModal!: DonationModalComponent;
  
  constructor(private titleService: Title) {}

  ngOnInit() {
    //this.titleService.setTitle('My Page Title');
  }


  scrollToSection() {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  openDonationModel = ()=>{
    this.donationModal.open();
  }
}
