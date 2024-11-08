import { Component, Input } from '@angular/core';
import { IAnimoji } from '../../../interfaces/effects';
import { Subscription } from 'rxjs';
import { IGameEvent, LocalGameEvent } from '../../../interfaces/game';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { IPlayer } from '../../../interfaces/player';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reactions',
  standalone: true,
  imports: [NgIf],
  templateUrl: './reactions.component.html',
  styleUrl: './reactions.component.css'
})
export class ReactionsComponent {
  @Input() player!: IPlayer;
  
  animojis: { [key: string]: IAnimoji } = {
    "Drool": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f924/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f924/512.gif",
      alt: "🤤",
      lifeTimeInMS: 3000
    },
    "Clap": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/512.gif",
      alt: "👏",
      lifeTimeInMS: 5000
    },
    "Imp-smile": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f608/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f608/512.gif",
      alt: "😈",
      lifeTimeInMS: 3000
    },
    "Kissing-heart": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/512.gif",
      alt: "😘",
      lifeTimeInMS: 1500
    },
    "Laughing": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f606/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f606/512.gif",
      alt: "😆",
      lifeTimeInMS: 1500
    },
    "Mouth-open": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e/512.gif",
      alt: "😮",
      lifeTimeInMS: 3000
    },
    "Melting": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/512.gif",
      alt: "🫠",
      lifeTimeInMS: 1500
    },
    "Rage": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/512.gif",
      alt: "😡",
      lifeTimeInMS: 3000
    },
    "Salute": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1fae1/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1fae1/512.gif",
      alt: "🫡",
      lifeTimeInMS: 3000
    },
    "Scream-cat": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f640/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f640/512.gif",
      alt: "🙀",
      lifeTimeInMS: 3000
    },
    "Sunglasses": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.gif",
      alt: "😎",
      lifeTimeInMS: 2000
    },
    "Thumbs-down": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif",
      alt: "👎",
      lifeTimeInMS: 3000
    },
    "Victory": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/512.gif",
      alt: "✌",
      lifeTimeInMS: 1500
    },
    "Weary": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f629/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f629/512.gif",
      alt: "😩",
      lifeTimeInMS: 1500
    },
    "Woozy": {
      webpSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f974/512.webp",
      gifSrc: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f974/512.gif",
      alt: "🥴",
      lifeTimeInMS: 1500
    }
  };

  selectedAnimoji!:IAnimoji;
  showing:boolean = false;
  showingTimeout:any;

  private subscriptions: Subscription = new Subscription();

  constructor(private webRTC: WebRTCService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.webRTC.localGameEvent.subscribe((localGameEvent:IGameEvent)=>{
        if (localGameEvent.event === LocalGameEvent.PlayReaction && localGameEvent.callingPlayer?.id === this.player.id) {
          this.playAnimoji(localGameEvent.payload.animojiId)
        }
      })
    );
  }

  playAnimoji = (animojiId:string)=>{
    this.selectedAnimoji = this.animojis[animojiId];
    if(!this.selectedAnimoji){return;}

    this.showing = true;
    this.clearTimeouts();
    this.showingTimeout = setTimeout(()=>{
      this.showing = false;
      this.clearTimeouts();
    },this.selectedAnimoji.lifeTimeInMS || 2000)
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
    this.subscriptions.unsubscribe();
  }

  private clearTimeouts() {
    if (this.showingTimeout) {
      clearTimeout(this.showingTimeout);
      this.showingTimeout = null;
    }
  }
}
