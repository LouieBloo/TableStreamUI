import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneLandingComponent } from './phone-landing.component';

describe('PhoneLandingComponent', () => {
  let component: PhoneLandingComponent;
  let fixture: ComponentFixture<PhoneLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
