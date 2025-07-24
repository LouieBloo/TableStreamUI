import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeTotalDropzoneComponent } from './life-total-dropzone.component';

describe('LifeTotalDropzoneComponent', () => {
  let component: LifeTotalDropzoneComponent;
  let fixture: ComponentFixture<LifeTotalDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifeTotalDropzoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeTotalDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
