import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalUserStreamComponent } from './local-user-stream.component';

describe('LocalUserStreamComponent', () => {
  let component: LocalUserStreamComponent;
  let fixture: ComponentFixture<LocalUserStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalUserStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalUserStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
