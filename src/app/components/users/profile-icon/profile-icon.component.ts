import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameYinYang, gameZeusSword, gameWyvern, gameWrappedHeart, gameWoodenPegleg, gameWolfHowl, gameWitchFlight, gameWingfoot, gameBookmarklet, gameBoba, gameFairyWand, gameEvilBat, gameDwarfFace, gameDrippingSword, gameDreadSkull } from '@ng-icons/game-icons';

@Component({
  selector: 'app-profile-icon',
  standalone: true,
  imports: [NgClass, NgIcon],
  templateUrl: './profile-icon.component.html',
  styleUrl: './profile-icon.component.css',
  viewProviders: [provideIcons({ 
      bootstrapPersonCircle,
      gameYinYang,
      gameZeusSword,
      gameWyvern,
      gameWrappedHeart,
      gameWoodenPegleg,
      gameWolfHowl,
      gameWitchFlight,
      gameWingfoot,
      gameBookmarklet,
      gameBoba,
      gameFairyWand,
      gameEvilBat,
      gameDwarfFace,
      gameDrippingSword,
      gameDreadSkull
    })]
})
export class ProfileIconComponent {
  @Input() iconId:string | undefined = "bootstrapPersonCircle"
  @Input() color:string | undefined = "#ffffff";
  @Input() classes!:string;
}
