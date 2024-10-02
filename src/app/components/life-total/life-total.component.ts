import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapSuitHeartFill } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { IPlayer } from '../../interfaces/player';
import { GameEvent } from '../../interfaces/game';
import { PropertyCounterComponent } from '../property-counter/property-counter.component';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-life-total',
  standalone: true,
  imports: [NgIconComponent,NgClass,NgIf,TitleCasePipe,PropertyCounterComponent,TooltipDirective],
  templateUrl: './life-total.component.html',
  styleUrl: './life-total.component.css',
  viewProviders: [provideIcons({ bootstrapSuitHeartFill })]
})
export class LifeTotalComponent {
  // @Input() lifeTotal!: number;
  // @Input() playerName!:string;
  @Input() player!:IPlayer;
  @Input() modifyCallback!: (amount:number)=> void;
  @Input() modifyPoisonCallback!: (amount:number)=> void;
  @Input() modifyEnergyCallback!: (amount:number)=> void;
  @Input() editable!:boolean;

  showPoisonCounter!:boolean;
  showEnergyCounter!:boolean;

  private inputSubscription!: Subscription;

  constructor(private inputService: InputService, private webRtc: WebRTCService){
    
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

}
