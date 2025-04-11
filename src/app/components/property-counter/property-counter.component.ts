import { Component, Input } from '@angular/core';
import { IPlayer } from '../../interfaces/IPlayer';
import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-property-counter',
  standalone: true,
  imports: [NgIf,NgClass,TitleCasePipe,TooltipDirective,NgIcon],
  templateUrl: './property-counter.component.html',
  styleUrl: './property-counter.component.css'
})
export class PropertyCounterComponent {
  @Input() editable!:boolean;
  @Input() title!:string;
  @Input() tooltip!:string;
  @Input() total!:number;
  // text in front of the actual number for the counter
  @Input() totalString!:string;
  // if true the side buttons will be joined together
  @Input() joined:boolean = true;
  @Input() modifyCallback:any;
  @Input() iconClass!:string;
  @Input() iconColor!:string;
  // + and - button class (mainly for rounding)
  @Input() buttonClass!: string;
  @Input() fullWidth:boolean = false;
}
