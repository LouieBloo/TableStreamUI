import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCounterComponent } from './property-counter.component';

describe('PropertyCounterComponent', () => {
  let component: PropertyCounterComponent;
  let fixture: ComponentFixture<PropertyCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
