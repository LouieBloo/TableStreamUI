import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapSuitHeartFill } from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { PropertyCounterComponent } from '../property-counter/property-counter.component';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { GameService } from '../../services/game/game.service';
import { IPlayer, PlayerProperties } from '../../interfaces/IPlayer';
import { GameEvent, GameProperties, IModifyGameProperty, IModifyPlayerProperty } from '../../interfaces/IGame';

@Component({
  selector: 'app-life-total',
  standalone: true,
  imports: [NgClass,NgIf,TitleCasePipe,PropertyCounterComponent,TooltipDirective],
  templateUrl: './life-total.component.html',
  styleUrl: './life-total.component.css',
  viewProviders: [provideIcons({ bootstrapSuitHeartFill })]
})
export class LifeTotalComponent {
  @Input() player!:IPlayer;
  @Input() modifyCallback!: (amount:number)=> void;
  @Input() modifyPoisonCallback!: (amount:number)=> void;
  @Input() modifyEnergyCallback!: (amount:number)=> void;
  @Input() editable!:boolean;
  @Input() toggleCommanderDamages!: ()=> void;

  showPoisonCounter!:boolean;
  showEnergyCounter!:boolean;

  private inputSubscription!: Subscription;

  constructor(private inputService: InputService, private webRtc: WebRTCService, public gameService:GameService){
  }


  ngAfterViewInit(){
    if(this.editable){
      this.inputSubscription = this.inputService.subscribe((userInputAction: UserInputAction)=>{
        if(userInputAction == UserInputAction.ModifyHealth1){
          this.modifyCallback(1);
        }else if(userInputAction == UserInputAction.ModifyHealthMinus1){
          this.modifyCallback(-1);
        }
      })
    }
  }

  ngOnDestroy(): void {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  setToZero = ()=>{
    this.modifyCallback(-this.player.lifeTotal);
  }

  toggleMonarch = ()=>{
    this.webRtc.sendGameEvent({event: GameEvent.ToggleMonarch});
  }

  toggleCitiesBlessing = ()=>{
    let payload: IModifyPlayerProperty = {
      property: PlayerProperties.citiesBlessing,
      amountToModify: 1
    }
    this.webRtc.sendGameEvent({event: GameEvent.ModifyPlayerProperty, payload: payload });
  }

  toggleDayNightCycle = ()=>{
    let payload: IModifyGameProperty = {
      property: GameProperties.DayNightCycle,
      value: this.gameService.isDay ? "NIGHT" : "DAY"
    }
    this.webRtc.sendGameEvent({event: GameEvent.ModifyGameProperty, payload: payload });
  }

}
