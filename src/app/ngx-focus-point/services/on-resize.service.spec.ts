import { TestBed } from '@angular/core/testing';

import { OnResizeService } from './on-resize.service';

describe('OnResizeService', () => {
  let service: OnResizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnResizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
