import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevClassifyComponent } from './dev-classify.component';

describe('DevClassifyComponent', () => {
  let component: DevClassifyComponent;
  let fixture: ComponentFixture<DevClassifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevClassifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevClassifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
