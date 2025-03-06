import { Component } from '@angular/core';
import { IMongoImage } from '../../../interfaces/IDev';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';

@Component({
  selector: 'app-dev-classify-train-slice',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './dev-classify-train-slice.component.html',
  styleUrl: './dev-classify-train-slice.component.css'
})
export class DevClassifyTrainSliceComponent {

  images!: IMongoImage[];
  currentImage!: IMongoImage;
  currentIndex: number = 0;

  password:any = {
    value:""
  }

  constructor(private http: HttpClient, private alerts:AlertsService, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.password.value = this.localStorageService.devPassword;
  }

  async loadImages(): Promise<void> {
    try {
      this.localStorageService.setDevPassword(this.password.value);

      let params = new HttpParams();

      params = params.set('imageType', 'BOARD');
      params = params.set('status', 'PENDING_SLICE');

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.get<IMongoImage[]>(`${environment.socketUrl}/classify/train/images`, { params, headers })
      );
      this.images = data;
      if (this.images.length > 0) {
        this.currentImage = this.images[this.currentIndex];
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  async deleteImage(){
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.delete<any>(`${environment.socketUrl}/classify/train/images/${this.currentImage._id}`,{headers})
      );

      this.alerts.addAlert("success", "Image deleted")
      
      this.nextImage();
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  previousImage(){
    this.currentIndex--;
    if(this.currentIndex < 0){
      this.currentIndex = this.images.length-1;
    }

    this.currentImage = this.images[this.currentIndex];
  }

  nextImage(){
    this.currentIndex++;
    if(this.currentIndex > this.images.length -1){
      this.currentIndex = 0;
    }

    this.currentImage = this.images[this.currentIndex];
  }

  async markComplete(){
    try {
      let image:IMongoImage = JSON.parse(JSON.stringify(this.currentImage));
      image.status = "SLICED"

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.password.value}`, // Replace `your-token-here` with your actual token
      });

      const data = await firstValueFrom(
        this.http.patch<any>(`${environment.socketUrl}/classify/train/images/${this.currentImage._id}`,image,{ headers } )
      );

      this.alerts.addAlert("success", "Image Saved")
      
      this.nextImage();
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

}
