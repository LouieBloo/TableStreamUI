import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationBubbleComponent } from './donation-bubble.component';

describe('DonationBubbleComponent', () => {
  let component: DonationBubbleComponent;
  let fixture: ComponentFixture<DonationBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationBubbleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
