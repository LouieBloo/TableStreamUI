import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { bootstrapSuitHeartFill } from '@ng-icons/bootstrap-icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

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
}
