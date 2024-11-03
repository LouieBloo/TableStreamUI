import { TestBed } from '@angular/core/testing';

import { CardSearchService } from './card-search.service';

describe('CardSearchService', () => {
  let service: CardSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
