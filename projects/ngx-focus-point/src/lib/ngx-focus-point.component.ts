import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

import {OnResizeService} from './on-resize.service';
import {PlatformService} from './platform.service';

@Component({
  selector: 'ngx-focus-point',
  templateUrl: './ngx-focus-point.component.html',
  styleUrls: ['./ngx-focus-point.component.scss'],
  providers: [OnResizeService],
})
export class NgxFocusPointComponent implements OnInit, OnDestroy, OnChanges {
  @Input() width?: string;
  @Input() height?: string;
  @Input() focusX: number | undefined = 0.0;
  @Input() focusY: number | undefined = 0.0;
  @Input() animation: string | undefined;
  @Input() scale = 1;
  @Output() error = new EventEmitter<Event>();
  public maxWidth = 0;
  public maxHeight = 0;
  public imagePositionLeft: string | number | undefined;
  public imagePositionTop: string | number | undefined;
  private containerWidth: number | undefined;
  private containerHeight: number | undefined;
  private imageWidth: number | undefined;
  private imageHeight: number | undefined;
  private ComponentElements: HTMLElement | undefined;
  private MediaElement: HTMLImageElement | HTMLVideoElement | undefined;
  private imageSubscription: Subscription | undefined;
  private resizeSub$: Subscription | undefined;
  private imageErrorSubscription: Subscription | undefined;
  private previousSrc: any;
  private css = `
        z-index: inherit;
        position: absolute;
        left: 0;
        top: 0;
        margin: 0;
        padding: 0;
        display: block;
        width: auto;
        height: auto;
        min-width: 100%;
        min-height: 100%;
        max-height: none;
        max-width: none;
        backface-visibility: hidden;
        transform: translate3d(0%, 0%, 0);
    `;
  private initCss = `transform: none;`;

  constructor(
    private elRef: ElementRef,
    private onResizeSvc: OnResizeService,
    public platformSvc: PlatformService
  ) {
    if (!this.focusX) {
      this.focusX = 0.0;
    }
    if (!this.focusY) {
      this.focusY = 0.0;
    }
  }

  ngOnInit() {
    if (this.platformSvc.isPlatformBrowser) {
      this.css = this.animation
        ? this.css +
        `transition: left ${this.animation}, top ${this.animation} ease-in-out;`
        : this.css;

      this.ComponentElements = this.elRef.nativeElement;
      this.MediaElement = this.ComponentElements?.querySelector(
        'img'
      ) as HTMLImageElement;
      if (!this.MediaElement) {
        this.MediaElement = this.ComponentElements?.querySelector(
          'video'
        ) as HTMLVideoElement;
        if (this.MediaElement.hasAttribute('muted')) {
          this.MediaElement.muted = true;
        }
        this.imageErrorSubscription = fromEvent(this.MediaElement, 'error')
          .pipe(tap((error) => this.error.emit(error)))
          .subscribe();

        this.imageSubscription = fromEvent(this.MediaElement, 'loadeddata')
          .pipe(
            tap((event) => {
              // Prep for when img src changes.
              (this.MediaElement as HTMLElement).style.cssText = this.initCss;
              this.MediaElement?.classList?.add('focus-point');
              (this.MediaElement as HTMLElement).style.cssText = this.css;
              this.imageHeight = this.MediaElement?.offsetHeight;
              this.imageWidth = this.MediaElement?.offsetWidth;
              this.adjustFocus();
              this.previousSrc = this.MediaElement?.getAttribute('src');
            })
          )
          .subscribe();
      } else {
        this.imageErrorSubscription = fromEvent(this.MediaElement, 'error')
          .pipe(tap((error) => this.error.emit(error)))
          .subscribe();
        this.imageSubscription = fromEvent(this.MediaElement, 'load')
          .pipe(
            tap((event) => {
              // Prep for when img src changes.
              (this.MediaElement as HTMLElement).style.cssText = this.initCss;
              this.MediaElement?.classList?.add('focus-point');
              (this.MediaElement as HTMLElement).style.cssText = this.css;
              this.imageHeight = this.MediaElement?.offsetHeight;
              this.imageWidth = this.MediaElement?.offsetWidth;
              this.adjustFocus();
              this.previousSrc = this.MediaElement?.getAttribute('src');
            })
          )
          .subscribe();
      }

      const elements = this.onResizeSvc.onResize([
        this.ComponentElements as HTMLElement,
      ]);
      this.resizeSub$ = fromEvent(elements[0], 'resize')
        // const resize = new OnResize([this.ComponentElements]);
        // this.resizeSub$ = fromEvent(resize.elements[0], 'resize')
        .pipe(
          tap((event) => {
            this.adjustFocus();
          })
        )
        .subscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.adjustFocus();
  }

  ngOnDestroy(): void {
    try {
      if (this.imageErrorSubscription) {
        this.imageErrorSubscription.unsubscribe();
      }
      if (this.resizeSub$) {
        this.resizeSub$.unsubscribe();
      }
      if (this.imageSubscription) {
        this.imageSubscription.unsubscribe();
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Calculate the new left/top values of an image
  public calcShift(
    conToImageRatio: number,
    containerSize: number,
    imageSize: number,
    focusSize: number,
    toMinus?: boolean,
    scale = 0
  ): number {
    const containerCenter = Math.floor(containerSize / 2); // Container center in px

    const focusFactor = (focusSize + 1) / 2; // Focus point of resize image in px

    const scaledImage = Math.floor(imageSize / conToImageRatio); // Can't use width() as images may be display:none
    let focus = Math.floor(focusFactor * scaledImage);

    if (toMinus) {
      focus = scaledImage - focus;
    }
    let focusOffset = focus - containerCenter; // Calculate difference between focus point and center
    const remainder = scaledImage - focus; // Reduce offset if necessary so image remains filled
    const containerRemainder = containerSize - containerCenter;
    if (remainder < containerRemainder) {
      focusOffset -= containerRemainder - remainder;
    }

    if (focusOffset < 0) {
      focusOffset = 0;
    }

    return (focusOffset * -100) / containerSize;
  }

  private adjustFocus() {
    if (this.ComponentElements) {
      this.containerHeight = this.ComponentElements.offsetHeight;
      this.containerWidth = this.ComponentElements.offsetWidth;

      let hShift: string | number = 0;
      let vShift: string | number = 0;

      const wR = (this.imageWidth as number) / this.containerWidth;
      const hR = (this.imageHeight as number) / this.containerHeight;

      (this.MediaElement as HTMLElement).style.maxHeight = '';
      (this.MediaElement as HTMLElement).style.maxWidth = '';

      if (
        (this.imageWidth as number) > this.containerWidth &&
        (this.imageHeight as number) > this.containerHeight
      ) {
        if (wR > hR) {
          this.maxHeight = 100;
          (this.MediaElement as HTMLElement).style.maxHeight = '100%';
        } else {
          this.maxWidth = 100;
          (this.MediaElement as HTMLElement).style.maxWidth = '100%';
        }
      }
      if (wR > hR) {
        hShift = this.calcShift(
          hR,
          this.containerWidth,
          this.imageWidth as number,
          parseFloat(!this.focusX ? '0.0' : this.focusX.toString()),
          false,
          this.scale
        );
      } else if (wR < hR) {
        vShift = this.calcShift(
          wR,
          this.containerHeight,
          this.imageHeight as number,
          parseFloat(!this.focusY ? '0.0' : this.focusY.toString()),
          true,
          this.scale
        );
      }
      const Y = parseFloat(!this.focusY ? '0.0' : this.focusY.toString());
      const X = parseFloat(!this.focusX ? '0.0' : this.focusX.toString());

      if (this.scale > 1) {
        // TODO: find max edge.
        (this.MediaElement as HTMLElement).style.transform = `translateX(${
          this.scale * (X * -50)
        }%) translateY(${this.scale * (Y * 50)}%)  scale(${this.scale})`;
        // this.MediaElement.style.transform = `scale(${this.scale})`;
        (this.MediaElement as HTMLElement).style.left = `${hShift}%`;
        (this.MediaElement as HTMLElement).style.top = `${vShift}%`;
        this.imagePositionLeft = hShift;
        this.imagePositionTop = vShift;
      } else {
        // this.MediaElement.style.transform = `translateX(${X}%) translateY(${Y}%) scale(${this.scale})`;

        (this.MediaElement as HTMLElement).style.left = `${hShift}%`;
        (this.MediaElement as HTMLElement).style.top = `${vShift}%`;
        this.imagePositionLeft = hShift;
        this.imagePositionTop = vShift;
      }
    }
  }
}
