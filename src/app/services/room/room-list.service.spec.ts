import { TestBed } from '@angular/core/testing';

import { RoomListService } from './room-list.service';

describe('RoomListService', () => {
  let service: RoomListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
