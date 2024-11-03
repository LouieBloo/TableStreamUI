import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../services/game/game.service';

@Component({
  selector: 'app-coin-flip',
  standalone: true,
  imports: [FormsModule,NgClass,NgIf],
  templateUrl: './coin-flip.component.html',
  styleUrl: './coin-flip.component.css'
})
export class CoinFlipComponent {
  @Input() result!: string;

  isFlipping: boolean = false;

  constructor(private gameService:GameService){

  }

  ngOnInit(): void {
    this.flipCoin();
  }

  flipCoin() {
    this.isFlipping = true;

    // Start animation
    setTimeout(() => {
      this.isFlipping = false;
    }, 1500); // Animation duration
  }

  get animationClass() {
    if (this.isFlipping) {
      return this.result === 'heads' ? 'animate-flipToHeads' : 'animate-flipToTails';
    }
    return '';
  }

  get headsImg(){
    return `${this.gameService.room.game?.coinImagePathPrefix}-heads.png`
  }

  get tailsImg(){
    return `${this.gameService.room.game?.coinImagePathPrefix}-tails.png`
  }

  get winnerImg(){
    return this.result == 'tails' ? this.tailsImg : this.headsImg;
  }
}
