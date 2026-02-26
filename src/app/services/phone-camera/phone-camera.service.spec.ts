import { TestBed } from "@angular/core/testing";
import { PhoneCameraService } from "./phone-camera.service";


describe('QrCodeService', () => {
  let service: PhoneCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhoneCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
