import { Injectable } from '@angular/core';
import { Howl } from 'howler';
import { ISound } from '../../interfaces/effects';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  constructor(private settingService:SettingsService) { }

  playSound(sound: ISound){
    const audio = new Howl({
      src: [sound.url],
      volume: this.settingService.effectVolume
    });
    audio.play();
  }
  
}
