import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteUserStreamComponent } from './remote-user-stream.component';

describe('RemoteUserStreamComponent', () => {
  let component: RemoteUserStreamComponent;
  let fixture: ComponentFixture<RemoteUserStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteUserStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteUserStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
