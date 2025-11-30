import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeModalComponent } from './qr-code-modal.component';

describe('QrCodeModalComponent', () => {
  let component: QrCodeModalComponent;
  let fixture: ComponentFixture<QrCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
