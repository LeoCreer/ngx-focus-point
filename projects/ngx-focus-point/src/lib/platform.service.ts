import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
//
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  public isPlatformBrowser = isPlatformBrowser(this.platformID);
  public isPlatformServer = isPlatformServer(this.platformID);
  public info;

  constructor(
    @Inject(PLATFORM_ID) private platformID: object,
  ) {

  }
}
