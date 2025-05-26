import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './input-error.component.html',
  styleUrl: './input-error.component.css'
})
export class InputErrorComponent {
  @Input() inputForm!:FormGroup;
  @Input() inputKey!:string;
}
