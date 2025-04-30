import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { IDonation } from '../../../interfaces/IDonations';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-donation-bubble',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './donation-bubble.component.html',
  styleUrl: './donation-bubble.component.css'
})
export class DonationBubbleComponent {
  @Input() donation!: IDonation;
  @Input() callbackWhenDead!: (donation: IDonation) => void;

  @Input() lifeTimeInSeconds: number = 5;
  @Input() moveDistancePx: number = 400;
  @Input() moveIntervalMs: number = 20; 
  
  private startTime!: number;
  private yOffset:number = 70;
  private intervalId!: any;
  private fadeTimeoutId!: any;

  fadeOut: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Start position
    this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
    this.renderer.setStyle(this.el.nativeElement, 'top', '0px');
    this.renderer.setStyle(this.el.nativeElement, 'right', '-50px');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateX(-50%)');

    
    this.startTime = Date.now();

    // Animate downward
    this.intervalId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000; // seconds
      const progress = Math.min(elapsed / this.lifeTimeInSeconds, 1); // 0 → 1

      if(progress >= 0.8){

      }

      const currentY = progress * this.moveDistancePx;
      this.renderer.setStyle(this.el.nativeElement, 'top', `${currentY+this.yOffset}px`);

      if (progress >= 1) {
        this.cleanup();
        if (this.callbackWhenDead) {
          this.callbackWhenDead(this.donation);
        }
      }
    }, this.moveIntervalMs);

    // Setup fade out near the end (e.g., 1 second before end)
    this.fadeTimeoutId = setTimeout(() => {
      this.fadeOut = true;
    }, (this.lifeTimeInSeconds - 1) * 1000); 
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.fadeTimeoutId) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
  }
}
