import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { IPlayingCard } from '../../interfaces/IPlayingCard';

@Component({
  selector: 'app-card-classified-popup',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './card-classified-popup.component.html',
  styleUrl: './card-classified-popup.component.css'
})
export class CardClassifiedPopupComponent {
  @Input() card: IPlayingCard | null = null;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };

  @Input() set visible(isVisible: boolean) {
    this._visible = isVisible;
  }
  get visible(): boolean {
    return this._visible;
  }
  private _visible = false;

  @Output() share = new EventEmitter<{ card: IPlayingCard; sharePublic: boolean }>();
  @Output() dismiss = new EventEmitter<void>();

  private adjustedPosition = { x: 0, y: 0 };
  private dismissTimer: any;
  private timerStartTime: number = 0;
  private timeToFadeOut: number = 6000;
  private remainingTime: number = 6000;

  constructor(private elRef: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.pauseDismissTimer();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.resumeDismissTimer();
  }

    /**
   * Binds the host element's style attribute for fixed positioning.
   */
  @HostBinding('style')
  get hostStyle() {
    return {
      left: `${this.adjustedPosition.x}px`,
      top: `${this.adjustedPosition.y}px`,
      position: 'fixed',
      'z-index': 1050,
      visibility: this.adjustedPosition.x === 0 && this.adjustedPosition.y === 0 ? 'hidden' : 'visible',
    };
  }

  /**
   * Binds the host element's class attribute to apply Tailwind classes for
   * styling and enter/leave animations.
   */
  @HostBinding('class')
  get hostClass() {
    const baseClasses = 'block transition-opacity transition-transform duration-200 ease-in-out';
    
    // Apply classes based on the visibility state
    if (this.visible) {
      return `${baseClasses} opacity-100 scale-100 translate-y-0 pointer-events-auto`;
    }
    return `${baseClasses} opacity-0 scale-95 translate-y-2.5 pointer-events-none`;
  }

  /**
     * Lifecycle hook that detects when inputs change. We use it to trigger
     * the position calculation when the component becomes visible.
     */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        // When popup becomes visible, calculate its position and start the auto-dismiss timer.
        setTimeout(() => this.adjustPosition(), 50);
        this.startDismissTimer();
      } else {
        // When popup is hidden, clear the timer.
        this.clearDismissTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearDismissTimer();
  }


  /**
   * Calculates the final position of the popup, ensuring it does not
   * render outside the viewport boundaries.
   */
  private adjustPosition(): void {
    const popupElement = this.elRef.nativeElement;
    if (!popupElement) return;

    const popupWidth = popupElement.offsetWidth;
    const popupHeight = popupElement.offsetHeight;
    const margin = 16; // Margin from the viewport edge in pixels.

    // Start with the preferred position (offset from the cursor)
    let finalX = this.position.x + 75;
    let finalY = this.position.y - 150;

    // Adjust for right edge: If it would overflow, place it to the left of the cursor.
    if (finalX + popupWidth + margin > window.innerWidth) {
      finalX = this.position.x - popupWidth - 25;
    }

    // Adjust for left edge
    if (finalX < margin) {
      finalX = margin;
    }

    // Adjust for top edge
    if (finalY < margin) {
      finalY = margin;
    }

    // Adjust for bottom edge
    if (finalY + popupHeight + margin > window.innerHeight) {
      finalY = window.innerHeight - popupHeight - margin;
    }
    
    this.adjustedPosition = { x: finalX, y: finalY };


  }

  /**
   * Starts the initial 6-second timer.
   */
  private startDismissTimer(): void {
    this.clearDismissTimer();
    this.remainingTime = this.timeToFadeOut; // Reset to full duration
    this.timerStartTime = Date.now();
    this.dismissTimer = setTimeout(() => {
      this.onDismiss();
    }, this.remainingTime);
  }

  /**
   * Pauses the timer when the mouse enters the component.
   */
  private pauseDismissTimer(): void {
    if (!this.dismissTimer) return; // Do nothing if timer isn't active
    
    this.clearDismissTimer();
    const elapsedTime = Date.now() - this.timerStartTime;
    this.remainingTime -= elapsedTime;
  }

  /**
   * Resumes the timer with the remaining time when the mouse leaves.
   */
  private resumeDismissTimer(): void {
    // Don't resume if there's no time left or it's already been dismissed
    if (this.remainingTime <= 0 || !this.visible) {
      return;
    }
    
    this.clearDismissTimer();
    this.timerStartTime = Date.now();
    this.dismissTimer = setTimeout(() => {
      this.onDismiss();
    }, this.remainingTime);
  }

  /**
   * Clears the auto-dismiss timer.
   */
  private clearDismissTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null; // Indicate that the timer is not active
    }
  }

 
  onShare(sharePublic:boolean): void {
    if (this.card) {
      this.share.emit({card: this.card, sharePublic});
    }
    this.onDismiss(); // Dismiss after sharing
  }

  onDismiss(): void {
    this.clearDismissTimer();
    this.dismiss.emit();
  }
}
