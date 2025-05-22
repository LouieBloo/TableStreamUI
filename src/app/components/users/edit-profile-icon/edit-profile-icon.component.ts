import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { IProfileIcon } from '../../../interfaces/IUser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill, bootstrapShop, bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { gameAxeSword, gameBoba, gameBookmarklet, gameCoffeeCup, gameDreadSkull, gameDrippingSword, gameDwarfFace, gameEvilBat, gameFairyWand, gameWingfoot, gameWitchFlight, gameWolfHowl, gameWoodenPegleg, gameWrappedHeart, gameWyvern, gameYinYang, gameZeusSword } from '@ng-icons/game-icons';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-profile-icon',
  standalone: true,
  imports: [NgIcon,NgIf, NgClass,FormsModule,NgFor],
  templateUrl: './edit-profile-icon.component.html',
  styleUrl: './edit-profile-icon.component.css',
  //make sure to also update user-login component
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
export class EditProfileIconComponent {
  @Input() iconId = 'bootstrapPersonCircle';
  @Input() color = '#ffffff';

  /** notify parent of changes */
  @Output() iconChange = new EventEmitter<string>();
  @Output() colorChange = new EventEmitter<string>();

  dropdownOpen:boolean = false;

  iconOptions: IProfileIcon[] = [
    { id: 'bootstrapPersonCircle', label: 'Default'},
    { id: 'gameYinYang', label: 'Yin Yang' },
    { id: 'gameZeusSword', label: 'Zeus Sword' },
    { id: 'gameWyvern', label: 'Wyvern' },
    { id: 'gameWrappedHeart', label: 'Wrapped Heart' },
    { id: 'gameWoodenPegleg', label: 'Peg Leg' },
    { id: 'gameWolfHowl', label: 'Wolf Howl' },
    { id: 'gameWitchFlight', label: 'Witch' },
    { id: 'gameWingfoot', label: 'Winged Foot' },
    { id: 'gameBookmarklet', label: 'Open Book' },
    { id: 'gameBoba', label: 'Boba' },
    { id: 'gameFairyWand', label: 'Wand' },
    { id: 'gameEvilBat', label: 'Bat' },
    { id: 'gameDwarfFace', label: 'Dwarf' },
    { id: 'gameDrippingSword', label: 'Dripping Sword' },
    { id: 'gameDreadSkull', label: 'Skull' },

  ];

  selectIcon(id: string | undefined) {
    if(!id){return;}
    this.iconId = id;
    this.iconChange.emit(this.iconId);
  }

  onColorChange(color: string) {
    this.color = color;
    this.colorChange.emit(this.color);
  }

  get currentLabel(): string {
    const found = this.iconOptions.find(o => o.id === this.iconId);
    return found ? found.label + "" : this.iconId;
  }
}
