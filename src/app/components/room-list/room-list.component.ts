import { Component, Input } from '@angular/core';
import { IRoom } from '../../interfaces/IRoom';
import { Subscription } from 'rxjs';
import { RoomListService } from '../../services/room/room-list.service';
import { NgFor, NgIf } from '@angular/common';
import { GameType } from '../../interfaces/IGame';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { gameCombinationLock } from '@ng-icons/game-icons';
import { bootstrapUnlock, bootstrapLock, bootstrapLockFill } from '@ng-icons/bootstrap-icons';
import { TimerComponent } from '../timer/timer.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [NgIf, NgFor, NgIcon,TimerComponent],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css',
  viewProviders: [provideIcons({ gameCombinationLock, bootstrapUnlock, bootstrapLock, bootstrapLockFill })]
})
export class RoomListComponent {
  @Input() roomClickedCallback!: (room: IRoom) => void;
  @Input() createGameClickedCallback!: () => void;

  private subscriptions: Subscription = new Subscription();

  allRooms: IRoom[] = [];

  sortField: keyof IRoom = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  private timesUpdated: number = 0;
  private maxTimesUpdated: number = 15;
  private secondsBetweenUpdates: number = 15;
  private timerRef: any;
  public updateTimerDate!: Date;

  constructor(private roomListService: RoomListService) {

  }

  ngOnInit() {
    this.subscriptions.add(
      this.roomListService.rooms$
        .subscribe(rooms => {
          this.allRooms = rooms || [];
        })
    );

    this.startListUpdater();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopListUpdater();
  }

  roomClicked(room: IRoom) {
    if (this.roomClickedCallback) {
      this.roomClickedCallback(room);
    }
  }

  startListUpdater = () => {
    this.timesUpdated = 0;
    this.stopListUpdater();
    this.updateList();

    this.timerRef = setInterval(() => {
      this.updateList();
    }, this.secondsBetweenUpdates * 1000);
  }

  updateList = () => {
    this.roomListService.getRooms();
    this.timesUpdated++;
    this.updateTimerDate = new Date();
    if (this.timesUpdated >= this.maxTimesUpdated) {
      this.stopListUpdater();
    }
  }

  stopListUpdater = () => {
    if (this.timerRef) {
      clearInterval(this.timerRef);
    }
    this.timerRef = null;
  }

  get countDownTimerDate():Date{
    return new Date(this.updateTimerDate.getTime() + this.secondsBetweenUpdates * 1000);
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
      const aCmp: any = typeof aVal === 'boolean' ? (aVal ? 1 : 0) : aVal;
      const bCmp: any = typeof bVal === 'boolean' ? (bVal ? 1 : 0) : bVal;
      if (aCmp < bCmp) return this.sortDirection === 'asc' ? -1 : 1;
      if (aCmp > bCmp) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get sortDirectionSymbol(): string {
    return this.sortDirection == 'desc' ? '⇩' : '⇧';
  }

  gameTypeDisplay(gameType: any): string {
    return this.splitCamelCase(GameType[gameType] + "");
  }

  splitCamelCase(str: string) {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  }
}
