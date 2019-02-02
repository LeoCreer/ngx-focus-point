import { TestBed } from '@angular/core/testing';

import { NgxFocusPointService } from './ngx-focus-point.service';

describe('NgxFocusPointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxFocusPointService = TestBed.get(NgxFocusPointService);
    expect(service).toBeTruthy();
  });
});
