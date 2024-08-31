import { Component, Input } from '@angular/core';
import { IPlayer } from '../../interfaces/player';
import { NgClass, NgIf, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-property-counter',
  standalone: true,
  imports: [NgIf,NgClass,TitleCasePipe],
  templateUrl: './property-counter.component.html',
  styleUrl: './property-counter.component.css'
})
export class PropertyCounterComponent {
  @Input() editable!:boolean;
  @Input() title!:string;
  @Input() total!:number;

  @Input() modifyCallback:any;

  @Input() emoji!:string;
}
