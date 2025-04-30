import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapEyeSlashFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameCoffeeCup } from '@ng-icons/game-icons';

@Component({
  selector: 'app-donation-button',
  standalone: true,
  imports: [NgIcon,NgIf],
  templateUrl: './donation-button.component.html',
  styleUrl: './donation-button.component.css',
  viewProviders: [provideIcons({
    bootstrapEyeSlashFill,
    gameCoffeeCup
    })]
})
export class DonationButtonComponent {
  @Input() clickCallback:any;

  hidden:boolean = false;
}
