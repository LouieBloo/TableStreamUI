import { Component, Input } from '@angular/core';
import { ScryfallCard } from '../../interfaces/scryfall';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!:ScryfallCard;
}
