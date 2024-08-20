import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeTotalComponent } from './life-total.component';

describe('LifeTotalComponent', () => {
  let component: LifeTotalComponent;
  let fixture: ComponentFixture<LifeTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifeTotalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
