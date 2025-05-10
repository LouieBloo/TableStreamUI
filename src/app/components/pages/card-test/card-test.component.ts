import { Component } from '@angular/core';
import { CardComponent } from '../../card/card.component';
import { IPlayingCard } from '../../../interfaces/IPlayingCard';

@Component({
  selector: 'app-card-test',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './card-test.component.html',
  styleUrl: './card-test.component.css'
})
export class CardTestComponent {
  card: IPlayingCard = {
    "id": "a9738cda-adb1-47fb-9f4c-ecd930228c4d",
    "oracle_id": "37108cd4-bbab-4ce3-9ed6-f60e8422e703",
    "tcgplayer_id": 239857,
    "name": "Ragavan, Nimble Pilferer",
    "scryfall_uri": "https://scryfall.com/card/mh2/138/ragavan-nimble-pilferer?utm_source=api",
    "image_uris": {
      "small": "https://cards.scryfall.io/small/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg?1681963138",
      "normal": "https://cards.scryfall.io/normal/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg?1681963138",
      "large": "https://cards.scryfall.io/large/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg?1681963138",
      "png": "https://cards.scryfall.io/png/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.png?1681963138",
      "art_crop": "https://cards.scryfall.io/art_crop/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg?1681963138",
      "border_crop": "https://cards.scryfall.io/border_crop/front/a/9/a9738cda-adb1-47fb-9f4c-ecd930228c4d.jpg?1681963138"
    },
    "mana_cost": "{R}",
    "cmc": 1,
    "type_line": "Legendary Creature — Monkey Pirate",
    "oracle_text": "Whenever Ragavan deals combat damage to a player, create a Treasure token and exile the top card of that player's library. Until end of turn, you may cast that card.\nDash {1}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
    "colors": [
      "R"
    ],
    "color_identity": [
      "R"
    ],
    "legalities": {
      "standard": "not_legal",
      "future": "not_legal",
      "historic": "banned",
      "timeless": "legal",
      "gladiator": "legal",
      "pioneer": "not_legal",
      "explorer": "not_legal",
      "modern": "legal",
      "legacy": "banned",
      "pauper": "not_legal",
      "vintage": "legal",
      "penny": "not_legal",
      "commander": "legal",
      "oathbreaker": "legal",
      "standardbrawl": "not_legal",
      "brawl": "legal",
      "alchemy": "not_legal",
      "paupercommander": "not_legal",
      "duel": "banned",
      "oldschool": "not_legal",
      "premodern": "not_legal",
      "predh": "not_legal"
    },
    "reserved": false,
    "foil": true,
    "nonfoil": true,
    "reprint": false,
    "set": "mh2",
    "set_name": "Modern Horizons 2",
    "set_uri": "https://api.scryfall.com/sets/c1c7eb8c-f205-40ab-a609-767cb296544e",
    "rulings_uri": "https://api.scryfall.com/cards/a9738cda-adb1-47fb-9f4c-ecd930228c4d/rulings",
    "collector_number": "138",
    "digital": false,
    "rarity": "mythic",
    "prices": {
      "usd": "30.11",
      "usd_foil": "28.17",
      "eur": "26.45",
      "eur_foil": "33.70",
      "tix": "16.42"
    },
    "purchase_uris": {
      "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F239857%3Fpage%3D1",
    },
    classificationConfidence: .25
  }
}
