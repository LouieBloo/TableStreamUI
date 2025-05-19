import { Component } from '@angular/core';
import { TimerComponent } from "../../timer/timer.component";
import { GameService } from '../../../services/game/game.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { gameGamepadCross, gameHouse, gameSandsOfTime } from '@ng-icons/game-icons';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { InputService } from '../../../services/input/input.service';
import { UserInputAction } from '../../../interfaces/inputs';

@Component({
  selector: 'app-sidebar-game-info',
  standalone: true,
  imports: [TimerComponent, NgIcon, TooltipDirective],
  templateUrl: './sidebar-game-info.component.html',
  styleUrl: './sidebar-game-info.component.css',
    viewProviders: [provideIcons({ bootstrapPersonCircle, gameSandsOfTime, gameHouse, gameGamepadCross })]
})
export class SidebarGameInfoComponent {

  constructor(public gameService: GameService, public inputService:InputService){

  }

  get adjustedRoomName(){
    return this.gameService.room.name.length > 20 ? this.gameService.room.name.slice(0,19) + ".." : this.gameService.room.name;
  }

  openUserLogin(){
    this.inputService.triggerEvent(UserInputAction.OpenUserLogin);
  }
}
