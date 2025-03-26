import { Component, Input } from '@angular/core';
import { IPlayingCard } from '../../../interfaces/IPlayingCard';

@Component({
  selector: 'app-card-list-item',
  standalone: true,
  imports: [],
  templateUrl: './card-list-item.component.html',
  styleUrl: './card-list-item.component.css'
})
export class CardListItemComponent {
  @Input() card!:IPlayingCard;
}
