import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-life-total',
  standalone: true,
  imports: [],
  templateUrl: './life-total.component.html',
  styleUrl: './life-total.component.css'
})
export class LifeTotalComponent {
  @Input() lifeTotal!: number;
  @Input() modifyCallback!: (amount:number)=> void;
}
