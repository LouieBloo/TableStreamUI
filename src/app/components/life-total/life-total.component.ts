import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapSuitHeartFill } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { InputService } from '../../services/input/input.service';
import { UserInputAction } from '../../interfaces/inputs';

@Component({
  selector: 'app-life-total',
  standalone: true,
  imports: [NgIconComponent,NgClass],
  templateUrl: './life-total.component.html',
  styleUrl: './life-total.component.css',
  viewProviders: [provideIcons({ bootstrapSuitHeartFill })]
})
export class LifeTotalComponent {
  @Input() lifeTotal!: number;
  @Input() modifyCallback!: (amount:number)=> void;
  @Input() editable!:boolean;

  constructor(private inputService: InputService){
    inputService.subscribe((userInputAction: UserInputAction)=>{
      if(!this.editable){return;}

      if(userInputAction == UserInputAction.ModifyHealth1){
        this.modifyCallback(1);
      }else if(userInputAction == UserInputAction.ModifyHealthMinus1){
        this.modifyCallback(-1);
      }
    })
  }
}
