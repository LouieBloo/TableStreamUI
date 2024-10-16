import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpAddressWarningModalComponent } from './ip-address-warning-modal.component';

describe('IpAddressWarningModalComponent', () => {
  let component: IpAddressWarningModalComponent;
  let fixture: ComponentFixture<IpAddressWarningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpAddressWarningModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpAddressWarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
