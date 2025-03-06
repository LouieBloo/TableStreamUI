import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat',
  standalone: true,
  imports: [],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.css'
})
export class StatComponent {

  @Input() title: string|null = "";
  @Input() value: string | number | null = "";
}
