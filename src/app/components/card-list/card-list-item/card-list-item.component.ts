import { Component, Input } from '@angular/core';
import { PlayingCard } from '../../../interfaces/scryfall';

@Component({
  selector: 'app-card-list-item',
  standalone: true,
  imports: [],
  templateUrl: './card-list-item.component.html',
  styleUrl: './card-list-item.component.css'
})
export class CardListItemComponent {
  @Input() card!:PlayingCard;
}
