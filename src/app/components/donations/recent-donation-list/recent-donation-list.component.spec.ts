import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentDonationListComponent } from './recent-donation-list.component';

describe('RecentDonationListComponent', () => {
  let component: RecentDonationListComponent;
  let fixture: ComponentFixture<RecentDonationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentDonationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentDonationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
