import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IPlayingCard } from '../../interfaces/IPlayingCard';
import { GameType } from '../../interfaces/IGame';
import { environment } from '../../../environments/environment';
import { Game } from '../../classes/game/game';
import { IOnePieceCardSearchParams } from '../../interfaces/IOnePiece';

@Injectable({
  providedIn: 'root'
})
export class CardSearchService {

  private scryfallUrl = 'https://api.scryfall.com/cards/search';
  private scryfallNamedUrl = 'https://api.scryfall.com/cards/named';

  constructor(private http: HttpClient) { }

  searchCards(query: string, fuzzy: boolean = true, game: Game, options: any): Observable<IPlayingCard> {
    if (game.gameType == GameType.PokemonStandard)
      return this.searchPokemon(query, game.searchTag);

    if (game.gameType == GameType.YugiohStandard || game.gameType == GameType.YugiohDomain)
      return this.searchYugioh(query)

    if (game.gameType == GameType.OnePiece)
      return this.searchOnePiece(options);

    return this.searchScryfall(query, fuzzy, game.searchTag, options);
  }

  searchScryfall(query: string, fuzzy: boolean = true, format: string = 'commander', options: any = {}): Observable<any> {
    let searchQuery = query;
    if (fuzzy) {
      searchQuery = `${query}`;
    }

    if (options && options.includeOption && options.includeOption == 'tokens') {
      searchQuery += ' type:token';
    }
    else if (options && options.includeOption && options.includeOption == 'emblems') {
      searchQuery += ' type:emblem';
    } else {
      searchQuery += ' format=' + format
    }

    const params = new HttpParams().set('q', `${searchQuery}`);
    return this.http.get<any>(this.scryfallUrl, { params });
  }

  searchNamedScryfall(query: string, format: string = 'commander'): Observable<any> {
    let searchQuery = query;

    const params = new HttpParams().set('fuzzy', `${searchQuery}`).set('format', `${format}`);
    return this.http.get<any>(this.scryfallNamedUrl, { params });
  }

  searchByOracleId(oracleId: string): Observable<any> {
    const url = `https://api.scryfall.com/cards/search?q=oracleid:${oracleId}`;
    return this.http.get<any>(url);
  }


  searchPokemon(name: string, format: string = 'standard'): Observable<any> {
    let searchQuery = `name:"*${name}*" legalities.${format}:Legal`;
    const params = new HttpParams().set('query', searchQuery);
    return this.http.get<any>(environment.socketUrl + "/pokemon-cards", { params });
  }

  searchYugioh(name: string): Observable<any> {
    if (!name || name.length < 3) {
      return of({ data: [] });
    }
    const params = new HttpParams().set('fname', name);
    return this.http.get<IPlayingCard>(environment.socketUrl + "/yugioh-cards", { params });
  }

  searchOnePiece(searchParams: IOnePieceCardSearchParams): Observable<any> {
    let params = new HttpParams();

    // 1. Iterate over the properties of the search object
    Object.keys(searchParams).forEach(key => {
      const value = searchParams[key as keyof IOnePieceCardSearchParams];

      // 2. Only append parameters that have a truthy, non-empty value
      if (value !== undefined && value !== null && value !== '') {
        // Use .set() to add the parameter. HttpClient handles URL encoding automatically.
        params = params.set(key, value);
      }
    });
    return this.http.get<IPlayingCard>(environment.socketUrl + "/one-piece-cards", { params });
  }
}
