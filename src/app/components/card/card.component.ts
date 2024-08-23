import { Component, Input } from '@angular/core';
import { ScryfallCard } from '../../interfaces/scryfall';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() card!:ScryfallCard;

  @Input() showPopup:boolean = true;
}
