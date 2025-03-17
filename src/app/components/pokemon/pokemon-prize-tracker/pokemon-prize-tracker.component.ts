import { Component, Input } from '@angular/core';
import { GameService } from '../../../services/game/game.service';
import { NgIf, TitleCasePipe } from '@angular/common';
import { IPlayer } from '../../../interfaces/IPlayer';

@Component({
  selector: 'app-pokemon-prize-tracker',
  standalone: true,
  imports: [NgIf,TitleCasePipe],
  templateUrl: './pokemon-prize-tracker.component.html',
  styleUrl: './pokemon-prize-tracker.component.css'
})
export class PokemonPrizeTrackerComponent {
  @Input() player!:IPlayer;
  @Input() modifyPrizeCardsCallback!: (amount:number)=> void;
  @Input() editable!:boolean;

  constructor(public gameService: GameService){

  }
}
