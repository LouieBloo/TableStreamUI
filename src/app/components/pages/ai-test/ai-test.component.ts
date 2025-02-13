import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CardIdentifierService } from '../../../services/card-identifier/card-identifier.service';

@Component({
  selector: 'app-ai-test',
  standalone: true,
  imports: [NgIf],
  templateUrl: './ai-test.component.html',
  styleUrl: './ai-test.component.css'
})
export class AiTestComponent {
  photoFile: File | null = null;
  photoPreview: string | ArrayBuffer | null | undefined = null;
  imageElement: HTMLImageElement | null = null;

  output:any;

  constructor(private http: HttpClient, private cardIdentifierService:CardIdentifierService) {}

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.photoFile = file;

      // Create an image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageClick(event: MouseEvent) {
    if (!this.photoFile || !this.imageElement) {
      return;
    }

    // Get the click position relative to the image
    const rect = this.imageElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Normalize the click position based on the image size
    const normalizedX = clickX / rect.width;
    const normalizedY = clickY / rect.height;

    console.log(`Click position (normalized): X: ${normalizedX}, Y: ${normalizedY}`);

    // Prepare FormData to send the photo and click position
    const formData = new FormData();
    formData.append('file', this.photoFile);
    formData.append('x', normalizedX.toString());
    formData.append('y', normalizedY.toString());

    // Send the file and normalized click position to the classification service
    this.cardIdentifierService.classifyImage(this.photoFile, normalizedX, normalizedY,"").subscribe(
      (response:any) => {
          
      },
      (error:any) => {
          
      }
  );
  }

  onImageLoad(event: Event) {
    this.imageElement = event.target as HTMLImageElement;
  }
}
