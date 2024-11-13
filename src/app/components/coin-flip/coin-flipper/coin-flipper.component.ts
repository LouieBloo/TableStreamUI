import { Component, Input, Output } from '@angular/core';
import { CoinFlipComponent } from '../coin-flip/coin-flip.component';
import { NgFor, NgIf } from '@angular/common';
import { WebRTCService } from '../../../services/webRTC/web-rtc.service';
import { GameEvent, ICoinFlipResults, IGameEvent, LocalGameEvent } from '../../../interfaces/game';
import { Subscription } from 'rxjs';
import { SoundEffectModalComponent } from '../../modals/sound-effect-modal/sound-effect-modal.component';
import { SoundService } from '../../../services/sounds/sound.service';

@Component({
  selector: 'app-coin-flipper',
  standalone: true,
  imports: [CoinFlipComponent, NgFor, NgIf],
  templateUrl: './coin-flipper.component.html',
  styleUrl: './coin-flipper.component.css'
})
export class CoinFlipperComponent {

  @Input() playerId!: string;

  visible = false;
  activeCoins: any = [];

  private apiTimeout: any;
  private clearCoinTimeout: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private webRTC: WebRTCService, private soundService:SoundService) {}

  ngOnInit() {
    this.webRTC.subscribeToGameEvents(this.handleGameEvent);

    this.subscriptions.add(
      this.webRTC.localGameEvent.subscribe((localGameEvent:IGameEvent)=>{
        if (localGameEvent.event === LocalGameEvent.FlipCoins && localGameEvent.callingPlayer?.id === this.playerId) {
          return this.flipCoins(localGameEvent.payload.coinsToFlip);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.webRTC.unsubscribeToGameEvent(this.handleGameEvent);
    this.clearTimeouts();
    this.subscriptions.unsubscribe();
  }

  // Start the flipping process, called from the parent component
  public flipCoins(amountToFlip: number) {
    if (this.visible) return; // Prevent spamming

    this.visible = true;
    this.setApiTimeout();

    this.webRTC.sendGameEvent({
      event: GameEvent.FlipCoins,
      payload: { coinsToFlip: amountToFlip }
    });

    this.setClearCoinTimeout();
  }

  private showFlips(flips: ICoinFlipResults) {
    this.visible = true;
    this.clearTimeouts();

    // Populate activeCoins with the flip results
    this.activeCoins = flips.results.map(result => ({ result: result as 'heads' | 'tails' }));

    this.setClearCoinTimeout();

    this.soundService.playSound({
      name: 'Coin Flip',
      url: '/assets/sounds/coinFlip.mp3',
      animojiId: ''
    })
  }

  private handleGameEvent = (event: IGameEvent) => {
    if (event.event === GameEvent.FlipCoins && event.callingPlayer?.id === this.playerId) {
      return this.showFlips(event.response as ICoinFlipResults);
    }
  }

  private clearCoins = () => {
    this.activeCoins = [];
    this.visible = false;
    this.clearCoinTimeout = null;
  }

  // Helper methods to manage timeouts
  private setApiTimeout() {
    this.apiTimeout = setTimeout(() => {
      this.visible = false;
      this.apiTimeout = null;
    }, 5000);
  }

  private setClearCoinTimeout() {
    this.clearCoinTimeout = setTimeout(this.clearCoins, 3500);
  }

  private clearTimeouts() {
    if (this.apiTimeout) {
      clearTimeout(this.apiTimeout);
      this.apiTimeout = null;
    }
    if (this.clearCoinTimeout) {
      clearTimeout(this.clearCoinTimeout);
      this.clearCoinTimeout = null;
    }
  }
}
