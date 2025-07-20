import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { bootstrapSuitHeartFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';
import { WebRTCService } from '../../services/webRTC/web-rtc.service';
import { PropertyCounterComponent } from '../property-counter/property-counter.component';
import { Subscription } from 'rxjs';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { GameService } from '../../services/game/game.service';
import { IPlayer, PlayerProperties } from '../../interfaces/IPlayer';
import { GameEvent, GameProperties, IModifyGameProperty, IModifyPlayerProperty } from '../../interfaces/IGame';
import { gameBrokenHeart, gameCrown, gameDiceSixFacesFive, gameHealthNormal, gamePoisonBottle, gamePowerLightning, gameFairyWand, gameModernCity, gameSunCloud, gameTorch, gameDeathSkull, gameRadioactive, gameHearts } from '@ng-icons/game-icons';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-life-total',
  standalone: true,
  imports: [NgClass, NgIf, TitleCasePipe, PropertyCounterComponent, TooltipDirective, NgIcon,FormsModule, CdkDrag, CdkDropList, CdkDragPreview],
  templateUrl: './life-total.component.html',
  styleUrl: './life-total.component.css',
  viewProviders: [provideIcons({
    bootstrapSuitHeartFill,
    gameCrown,
    gameHealthNormal,
    gamePoisonBottle,
    gamePowerLightning,
    gameBrokenHeart,
    gameDiceSixFacesFive,
    gameFairyWand,
    gameTorch,
    gameModernCity,
    gameSunCloud,
    gameDeathSkull,
    gameRadioactive,
    gameHearts
  })]
})
export class LifeTotalComponent {
  @Input() player!: IPlayer;
  @Input() modifyCallback!: (amount: number) => void;
  @Input() modifyPoisonCallback!: (amount: number) => void;
  @Input() modifyEnergyCallback!: (amount: number) => void;
  @Input() modifyRadiationCallback!: (amount: number) => void;
  @Input() editable!: boolean;
  @Input() toggleCommanderDamages!: () => void;

  showPoisonCounter!: boolean;
  showEnergyCounter!: boolean;
  showRadiationCounter!:boolean;
  isDragging!:boolean;

  setLifeTotalAmount!:number;

  private inputSubscription!: Subscription;

  topLeftDropZoneList:any[] = [{
    title: 'Energy', 
    iconClass: 'gamePowerLightning', 
    iconColor: 'text-orange-600', 
    total: 0, 
  }];

  topRightDropZoneList:any[] = [{
    title: 'Poison', 
    iconClass: 'gameDeathSkull', 
    iconColor: 'text-green-600', 
    total: 0
  },{
    title: 'Rad', 
    iconClass: 'gameRadioactive', 
    iconColor: 'text-yellow-400', 
    total: 0
  }];
  

  constructor(private inputService: InputService, private webRtc: WebRTCService, public gameService: GameService, private cdr:ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (this.editable) {
      this.inputSubscription = this.inputService.subscribe((userInputAction: UserInputAction) => {
        if (userInputAction == UserInputAction.ModifyHealth1) {
          this.modifyCallback(1);
        } else if (userInputAction == UserInputAction.ModifyHealthMinus1) {
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

  setToZero = () => {
    this.modifyCallback(-this.player.lifeTotal);
  }

  setLifeTotal = ()=>{
    let difference:number = this.setLifeTotalAmount - this.player.lifeTotal;
    this.modifyCallback(difference);
  }

  toggleMonarch = () => {
    this.webRtc.sendGameEvent({ event: GameEvent.ToggleMonarch });
  }

  toggleInitiative = () => {
    this.webRtc.sendGameEvent({ event: GameEvent.ToggleInitiative });
  }

  toggleCitiesBlessing = () => {
    let payload: IModifyPlayerProperty = {
      property: PlayerProperties.citiesBlessing,
      amountToModify: 1
    }
    this.webRtc.sendGameEvent({ event: GameEvent.ModifyPlayerProperty, payload: payload });
  }

  toggleDayNightCycle = () => {
    let payload: IModifyGameProperty = {
      property: GameProperties.DayNightCycle,
      value: this.gameService.isDay ? "NIGHT" : "DAY"
    }
    this.webRtc.sendGameEvent({ event: GameEvent.ModifyGameProperty, payload: payload });
  }

  getCallback = (title:string)=>{
    switch(title){
      case 'Energy':
        return this.modifyEnergyCallback;
      case 'Poison':
        return this.modifyPoisonCallback;
      case 'Rad':
        return this.modifyRadiationCallback;
      default:
        return null;
    }
  }

  getTotal = (title:string)=>{
    switch(title){
      case 'Energy':
        return this.player?.energyTotal;
      case 'Poison':
        return this.player?.poisonTotal;
      case 'Rad':
        return this.player?.radiationTotal;
      default:
        return 0;
    }
  }

  getHidden = (title:string):boolean=>{
    switch(title){
      case 'Energy':
        return !this.showingEnergyPanel;
      case 'Poison':
        return !this.showingPoisonPanel;
      case 'Rad':
        return !this.showingRadPanel;
      default:
        return true;
    }
  }

  get showingPoisonPanel(): boolean {
    return this.showPoisonCounter || this.player.poisonTotal > 0;
  }

  get showingEnergyPanel(): boolean{
    return this.showEnergyCounter || this.player.energyTotal > 0
  }

  get showingRadPanel():boolean{
    return this.showRadiationCounter || this.player.radiationTotal > 0
  }

  drop(event: CdkDragDrop<any[]>) {
    console.log(event)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    // this.cdr.detectChanges(); // Or this.cdr.markForCheck();
  }

  // trackByItem(index: number, item: any): any {
  //   return item.id || item.title; // Use a truly unique identifier
  // }
}
