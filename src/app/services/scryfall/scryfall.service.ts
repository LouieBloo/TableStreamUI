import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ScryfallCard } from '../../interfaces/scryfall';

@Injectable({
  providedIn: 'root'
})
export class ScryfallService {
  
  private apiUrl = 'https://api.scryfall.com/cards/search';

  constructor(private http: HttpClient) { }

  searchCards(query: string, fuzzy: boolean = true, format: string = 'commander'): Observable<any> {
    let searchQuery = query;
    if (fuzzy) {
      searchQuery = `${query}`;
    }
    console.log(format)
    const params = new HttpParams().set('q', `${searchQuery} format=${format}`);
    return this.http.get<any>(this.apiUrl, { params });
  }


}
