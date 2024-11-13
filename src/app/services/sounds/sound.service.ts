import { Injectable } from '@angular/core';
import { Howl } from 'howler';
import { ISound } from '../../interfaces/effects';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  public effectVolume:number = 0.75;

  constructor() { }

  playSound(sound: ISound){
    const audio = new Howl({
      src: [sound.url],
      volume: this.effectVolume
    });
    audio.play();
  }
  
}
