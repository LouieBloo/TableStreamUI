import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevDragComponent } from './dev-drag.component';

describe('DevDragComponent', () => {
  let component: DevDragComponent;
  let fixture: ComponentFixture<DevDragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevDragComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevDragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
