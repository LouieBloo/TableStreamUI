import { TestBed } from '@angular/core/testing';

import { CardIdentifierService } from './card-identifier.service';

describe('CardIdentifierService', () => {
  let service: CardIdentifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardIdentifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
