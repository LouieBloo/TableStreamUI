import { NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-property-counter',
  standalone: true,
  imports: [NgIf, NgClass, TitleCasePipe],
  templateUrl: './property-counter.component.html',
  styleUrl: './property-counter.component.css',
})
export class PropertyCounterComponent {
  @Output() incrementClicked: EventEmitter<number> = new EventEmitter<number>();
  @Input() editable!: boolean;
  @Input() title!: string;
  @Input() total!: number;
  @Input() modifyCallback: any;
  @Input() emoji!: string;

  incremement(number: number){
    this.incrementClicked.emit(number);
  }

}
