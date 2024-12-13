import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevClassifyTrainSliceComponent } from './dev-classify-train-slice.component';

describe('DevClassifyTrainSliceComponent', () => {
  let component: DevClassifyTrainSliceComponent;
  let fixture: ComponentFixture<DevClassifyTrainSliceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevClassifyTrainSliceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevClassifyTrainSliceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
