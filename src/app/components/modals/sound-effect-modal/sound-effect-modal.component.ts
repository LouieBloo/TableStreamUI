import { Component, Input } from '@angular/core';
import { ISound } from '../../../interfaces/effects';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent, IGameEvent, LocalGameEvent } from '../../../interfaces/game';
import { IPlayer } from '../../../interfaces/player';
import { GameService } from '../../../services/game/game.service';
import { SoundService } from '../../../services/sounds/sound.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings/settings.service';

@Component({
  selector: 'app-sound-effect-modal',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './sound-effect-modal.component.html',
  styleUrl: './sound-effect-modal.component.css'
})
export class SoundEffectModalComponent {
  @Input() localPlayer!: IPlayer;

  private subscriptions: Subscription = new Subscription();

  soundList: { [key: string]: ISound[] } = {
    "Aww": [{
      name: 'Cute Aww', url: '/assets/sounds/aww1.mp3', animojiId: "Weary", icon: "😩"
    },{
      name: 'Awohl', url: '/assets/sounds/ahow.mp3', animojiId: "Woozy", icon: "🥴"
    },{
      name: 'Aww Yeah', url: '/assets/sounds/awwYeah.mp3', animojiId: "Drool", icon: "🤤"
    }],
    "Boo": [{
      name: 'Crowd Boo', url: '/assets/sounds/boo.mp3', animojiId: "Thumbs-down", icon: "👎"
    },
    {
      name: 'Big Crowd Boo', url: '/assets/sounds/boo1.mp3', animojiId: "Thumbs-down", icon: "👎"
    },
    {
      name: 'Boooooo', url: '/assets/sounds/boo2.mp3', animojiId: "Thumbs-down", icon: "👎"
    }],
    "Clapping": [{
      name: 'Crowd Clapping', url: '/assets/sounds/clapping2.mp3', animojiId: "Clap", icon: "👏"
    },{
      name: 'Woo Hoo', url: '/assets/sounds/clapping1.mp3', animojiId: "Clap", icon: "👏"
    },
    ],
    "Laugh": [{
      name: 'Male Laugh', url: '/assets/sounds/maleLaugh.mp3', animojiId: "Laughing", icon: "😆"
    },{
      name: 'Evil Laugh', url: '/assets/sounds/dorkLaugh.mp3', animojiId: "Imp-smile", icon: "😈"
    },{
      name: 'Female Laugh', url: '/assets/sounds/femaleLaugh.mp3', animojiId: "Laughing", icon: "😆"
    }],
    "Misc": [{
      name: 'Tick Tock', url: '/assets/sounds/tickTock.mp3', animojiId: "Snail", icon: "🐌"
    },{
      name: 'Charge!', url: '/assets/sounds/charge1.mp3', animojiId: "Salute", icon: "🫡"
    },{
      name: 'Cheers', url: '/assets/sounds/toast.mp3', animojiId: "Clinking-glasses", icon: "🥂"
    },{
      name: 'Oops', url: '/assets/sounds/oops1.mp3', animojiId: "Melting", icon: "🫠"
    },{
      name: 'Right Baby', url: '/assets/sounds/thatsRightBaby.mp3', animojiId: "Kissing-heart", icon: "😘"
    },{
      name: 'Thats Right', url: '/assets/sounds/yeahThatsRight.mp3', animojiId: "Sunglasses", icon: "😎"
    }]
  };

  soundListKeys:string[]


  constructor(private webRTC:WebRTCService, private gameService:GameService, public soundService:SoundService, public settingService:SettingsService){
    this.subscriptions.add(
      this.webRTC.gameEvent.subscribe(event => this.handleGameEvent(event))
    );

    this.soundListKeys = Object.keys(this.soundList);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  open() {
    const dialogCheckbox = document.getElementById('soundEffectToggleModal');
    if (dialogCheckbox) {
      dialogCheckbox.click();
    }
  }

  handleGameEvent = (event: IGameEvent) => {
    if(!event.callingPlayer){return;}
    switch (event.event) {
      case GameEvent.PlayEffect:
        this.playSound(event.response.sound, event.callingPlayer)
        break;
    }
  }

  //start the effect process, tell the api to play this sound, we will play it when we receive the response
  playSoundLocal = (sound: ISound)=>{
    this.webRTC.sendGameEvent({
      event: GameEvent.PlayEffect,
      payload: {
        sound: sound
      }
    })

    const closeModalButton = document.getElementById('closeSoundEffectModal');
    if (closeModalButton) {
      closeModalButton.click();
    }
  }

  // plays the sound, will also tell the effect component to render the animoji
  playSound(sound: ISound, incomingPlayer: IPlayer) {
    const localIncomingPlayer:IPlayer | undefined = this.gameService.room.players.find(player=>{return player.id == incomingPlayer.id})

    if(!localIncomingPlayer){return;}

    if(!localIncomingPlayer.reactionsMuted){
      this.soundService.playSound(sound);

      this.webRTC.handleLocalGameEvent({
        event: LocalGameEvent.PlayReaction,
        callingPlayer: localIncomingPlayer,
        payload: {animojiId: sound.animojiId}
      })
    }
  }
}
