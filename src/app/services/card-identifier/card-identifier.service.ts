import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameService } from '../game/game.service';

@Injectable({
  providedIn: 'root'
})
export class CardIdentifierService {

  constructor(private http: HttpClient, private gameService:GameService) { }

  public classifyImage (photoFile:any, x:number, y:number, playerId:string): Observable<any> {
    // Prepare FormData to send the photo and click position
    const formData = new FormData();
    formData.append('file', photoFile);
    formData.append('x', x.toString());
    formData.append('y', y.toString());
    formData.append('roomId', this.gameService.room.id + "")
    formData.append('playerId', playerId)
    formData.append('classifier', "CNN_V2")

    // Replace this with your backend API endpoint
    const backendUrl = environment.cardIdentifierUrl + '/classify';

    return this.http.post(backendUrl, formData);
  }

  public transcribe(audioBlob: Blob):Observable<any>{
    const formData = new FormData();
    formData.append('audio', audioBlob);
     
    return this.http.post<{ transcript: string }>(`${environment.socketUrl}/transcribe`, formData)
  }
}
