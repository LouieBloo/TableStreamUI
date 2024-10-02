import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {

  @Input('appTooltip') tooltipText!: string;
  @Input() tooltipDirection: 'top' | 'bottom' | 'left' | 'right' = 'top'; // Default to 'top'
  @Input() tooltipStartOpen:boolean  = false;

  private hasHovered = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Add Daisy UI tooltip classes
    this.renderer.addClass(this.el.nativeElement, 'tooltip');
    this.renderer.setAttribute(this.el.nativeElement, 'data-tip', this.tooltipText);

    if(this.tooltipStartOpen){
      // Initially show the tooltip
      this.renderer.addClass(this.el.nativeElement, 'tooltip-open');
    }

    // Add the tooltip direction class
    const directionClass = `tooltip-${this.tooltipDirection}`;
    this.renderer.addClass(this.el.nativeElement, directionClass);
  }

  @HostListener('mouseover')
  onMouseOver() {
    if (!this.hasHovered) {
      // Remove the initial open state after the first hover
      this.renderer.removeClass(this.el.nativeElement, 'tooltip-open');
      this.hasHovered = true;
    }
  }

}
