import { Component, Input } from '@angular/core';
import { IRoom } from '../../interfaces/IRoom';
import { Subscription } from 'rxjs';
import { RoomListService } from '../../services/room-list.service';
import { NgFor, NgIf } from '@angular/common';
import { RoomListItemComponent } from "./room-list-item/room-list-item.component";

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [NgIf, RoomListItemComponent,NgFor],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent {
  @Input() roomClickedCallback!: (room: IRoom) => void;

  private subscriptions: Subscription = new Subscription();

  allRooms:IRoom[] = [];

  sortField: keyof IRoom = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private roomListService:RoomListService) {

  }

  ngOnInit() {
    this.subscriptions.add(
      this.roomListService.rooms$
        .subscribe(rooms => {
          this.allRooms = rooms || [];
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  roomClicked(room: IRoom) {
    if (this.roomClickedCallback) {
      this.roomClickedCallback(room);
    }
  }

  toggleSort(field: keyof IRoom) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

   get sortedRooms(): IRoom[] {
    return [...this.allRooms].sort((a, b) => {
      const aVal = a[this.sortField];
      const bVal = b[this.sortField];
      // normalize booleans to numbers for comparison
      const aCmp:any = typeof aVal === 'boolean' ? (aVal ? 1 : 0) : aVal;
      const bCmp:any = typeof bVal === 'boolean' ? (bVal ? 1 : 0) : bVal;
      if (aCmp < bCmp) return this.sortDirection === 'asc' ? -1 : 1;
      if (aCmp > bCmp) return this.sortDirection === 'asc' ?  1 : -1;
      return 0;
    });
  }
}
