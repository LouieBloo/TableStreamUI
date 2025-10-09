import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteCameraComponent } from './remote-camera.component';

describe('RemoteCameraComponent', () => {
  let component: RemoteCameraComponent;
  let fixture: ComponentFixture<RemoteCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
