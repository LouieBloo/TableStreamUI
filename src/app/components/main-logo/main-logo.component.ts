import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-main-logo',
  standalone: true,
  imports: [NgClass],
  templateUrl: './main-logo.component.html',
  styleUrl: './main-logo.component.css'
})
export class MainLogoComponent {
  @Input() size:string = "large";
  @Input() animationClass!:string;
}
