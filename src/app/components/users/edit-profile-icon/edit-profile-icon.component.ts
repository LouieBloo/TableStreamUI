import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { IProfileIcon } from '../../../interfaces/IUser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapReddit, bootstrapDiscord, bootstrapPlayFill, bootstrapInfoSquareFill, bootstrapShop, bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { gameAxeSword, gameBoba, gameBookmarklet, gameCoffeeCup, gameDreadSkull, gameDrippingSword, gameDwarfFace, gameEvilBat, gameFairyWand, gameWingfoot, gameWitchFlight, gameWolfHowl, gameWoodenPegleg, gameWrappedHeart, gameWyvern, gameYinYang, gameZeusSword } from '@ng-icons/game-icons';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ProfileIconComponent } from '../profile-icon/profile-icon.component';

@Component({
  selector: 'app-edit-profile-icon',
  standalone: true,
  imports: [NgIcon,NgIf, NgClass,FormsModule,NgFor,ProfileIconComponent],
  templateUrl: './edit-profile-icon.component.html',
  styleUrl: './edit-profile-icon.component.css',
  viewProviders: [provideIcons({ 
    
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
    { id: 'gameEvilBat', label: 'Bat' },
    { id: 'gameBoba', label: 'Boba' },
    { id: 'gameDrippingSword', label: 'Dripping Sword' },
    { id: 'gameDwarfFace', label: 'Dwarf' },
    { id: 'gameBookmarklet', label: 'Open Book' },
    { id: 'gameWoodenPegleg', label: 'Peg Leg' },
    { id: 'gameDreadSkull', label: 'Skull' },
    { id: 'gameFairyWand', label: 'Wand' },
    { id: 'gameWingfoot', label: 'Winged Foot' },
    { id: 'gameWitchFlight', label: 'Witch' },
    { id: 'gameWolfHowl', label: 'Wolf Howl' },
    { id: 'gameWrappedHeart', label: 'Wrapped Heart' },
    { id: 'gameWyvern', label: 'Wyvern' },
    { id: 'gameYinYang', label: 'Yin Yang' },
    { id: 'gameZeusSword', label: 'Zeus Sword' },
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
