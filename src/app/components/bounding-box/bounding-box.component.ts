import { NgIf, NgStyle } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-bounding-box',
  standalone: true,
  imports: [NgIf,NgStyle],
  templateUrl: './bounding-box.component.html',
  styleUrl: './bounding-box.component.css'
})
export class BoundingBoxComponent {
  @Input() boundingBox!: { x1: number; y1: number; x2: number; y2: number, top:number, left:number, width:number, height: number };
  @Input() videoElement!: HTMLVideoElement;

  boundingBoxVisible: boolean = true;
  boxOpacity: number = 1;

  // ngOnInit(): void {
  //   if (this.boundingBox && this.videoElement) {
  //     this.normalizeBoundingBox();
  //     this.startFadeOutTimer();
  //   }
  // }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['boundingBox'] && this.boundingBox && this.videoElement) {
      this.normalizeBoundingBox();
      this.showBoundingBox();
    }
  }

  private normalizeBoundingBox() {
    const rect = this.videoElement.getBoundingClientRect();
    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;

    const containerRatio = rect.width / rect.height;
    const videoRatio = videoWidth / videoHeight;

    let scale: number;
    let offsetX = 0;
    let offsetY = 0;

    // Determine how the video is letterboxed/pillarboxed
    if (containerRatio > videoRatio) {
      // The container is relatively wider than the video, so the video is fully tall
      scale = rect.height / videoHeight;
      const actualVideoWidth = videoWidth * scale;
      offsetX = (rect.width - actualVideoWidth) / 2;  // leftover space in X dimension
    } else {
      // The container is relatively narrower (or equal ratio),
      // so the video is fully wide
      scale = rect.width / videoWidth;
      const actualVideoHeight = videoHeight * scale;
      offsetY = (rect.height - actualVideoHeight) / 2; // leftover space in Y dimension
    }

    const x1Scaled = this.boundingBox.x1 * scale + offsetX;
    const x2Scaled = this.boundingBox.x2 * scale + offsetX;
    const y1Scaled = this.boundingBox.y1 * scale + offsetY;
    const y2Scaled = this.boundingBox.y2 * scale + offsetY;

    this.boundingBox = {
      x1: x1Scaled,
      y1: y1Scaled,
      x2: x2Scaled,
      y2: y2Scaled,
      top: y1Scaled,
      left: x1Scaled,
      width: x2Scaled - x1Scaled,
      height: y2Scaled - y1Scaled
    };
  }

  private showBoundingBox() {
    this.boundingBoxVisible = true;
    this.boxOpacity = 1; // Ensure opacity is reset
    this.startFadeOutTimer();
  }

  private startFadeOutTimer() {
    setTimeout(() => {
      this.boxOpacity = 0; // Start fading out
      setTimeout(() => {
        this.boundingBoxVisible = false; // Hide the bounding box completely
      }, 500); // Match the CSS transition duration
    }, 2000); // Show the box for 3 seconds
  }
}
