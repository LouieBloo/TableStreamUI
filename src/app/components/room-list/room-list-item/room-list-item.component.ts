import { Component, Input } from '@angular/core';
import { IRoom } from '../../../interfaces/IRoom';

@Component({
  selector: 'app-room-list-item',
  standalone: true,
  imports: [],
  templateUrl: './room-list-item.component.html',
  styleUrl: './room-list-item.component.css'
})
export class RoomListItemComponent {
  @Input() room!:IRoom;
  @Input() roomClickedCallback!: (room: IRoom) => void;
}
