import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { OnResizeService } from '../../services/on-resize.service';

@Component({
  selector: 'ngx-focus-point',
  templateUrl: './ngx-focus-point.component.html',
  styleUrls: ['./ngx-focus-point.component.scss'],
  providers: [OnResizeService],
})
export class NgxFocusPointComponent implements OnInit, OnDestroy, OnChanges {
  @Input() width?: string;
  @Input() height?: string;
  @Input() focusX = 0.0;
  @Input() focusY = 0.0;
  @Input() animation: string;
  @Input() scale = 1;
  public maxWidth: number;
  public maxHeight: number;
  public imagePositionLeft: string | number;
  public imagePositionTop: string | number;
  private containerWidth: number;
  private containerHeight: number;
  private imageWidth: number;
  private imageHeight: number;
  private ComponentElements: HTMLElement;
  private ImageElement: HTMLElement;
  private imageSubscription: Subscription;
  private resizeSub$: Subscription;
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

  constructor(private elRef: ElementRef, private onResizeSvc: OnResizeService) {
    if (!this.focusX) {
      this.focusX = 0.0;
    }
    if (!this.focusY) {
      this.focusY = 0.0;
    }
  }

  ngOnInit() {
    this.css = this.animation
      ? this.css + `transition: left ${this.animation}, top ${this.animation} ease-in-out;`
      : this.css;

    this.ComponentElements = this.elRef.nativeElement;
    this.ImageElement = this.ComponentElements.querySelector('img');

    this.imageSubscription = fromEvent(this.ImageElement, 'load')
      .pipe(
        tap((event) => {
          // Prep for when img src changes.
          this.ImageElement.style.cssText = this.initCss;
          this.ImageElement?.classList?.add('focus-point');
          this.ImageElement.style.cssText = this.css;
          this.imageHeight = this.ImageElement.offsetHeight;
          this.imageWidth = this.ImageElement.offsetWidth;
          this.adjustFocus();
          this.previousSrc = this.ImageElement.getAttribute('src');
        }),
      )
      .subscribe();

    const elements = this.onResizeSvc.onResize([this.ComponentElements]);
    this.resizeSub$ = fromEvent(elements[0], 'resize')
      .pipe(
        tap((event) => {
          this.adjustFocus();
        }),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.adjustFocus();
  }

  ngOnDestroy(): void {
    try {
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

  private adjustFocus() {
    if (this.ComponentElements) {
      this.containerHeight = this.ComponentElements.offsetHeight;
      this.containerWidth = this.ComponentElements.offsetWidth;

      let hShift: string | number = 0;
      let vShift: string | number = 0;

      const wR = this.imageWidth / this.containerWidth;
      const hR = this.imageHeight / this.containerHeight;

      this.ImageElement.style.maxHeight = '';
      this.ImageElement.style.maxWidth = '';

      if (this.imageWidth > this.containerWidth && this.imageHeight > this.containerHeight) {
        if (wR > hR) {
          this.maxHeight = 100;
          this.ImageElement.style.maxHeight = '100%';
        } else {
          this.maxWidth = 100;
          this.ImageElement.style.maxWidth = '100%';
        }
      }
      if (wR > hR) {
        hShift = this.calcShift(
          hR,
          this.containerWidth,
          this.imageWidth,
          parseFloat(!this.focusX ? '0.0' : this.focusX.toString()),
          false,
          this.scale,
        );
      } else if (wR < hR) {
        vShift = this.calcShift(
          wR,
          this.containerHeight,
          this.imageHeight,
          parseFloat(!this.focusY ? '0.0' : this.focusY.toString()),
          true,
          this.scale,
        );
      }
      const Y = parseFloat(!this.focusY ? '0.0' : this.focusY.toString());
      const X = parseFloat(!this.focusX ? '0.0' : this.focusX.toString());

      if (this.scale > 1) {
        // TODO: find max edge.
        this.ImageElement.style.transform = `translateX(${this.scale * (X * -50)}%) translateY(${
          this.scale * (Y * 50)
        }%)  scale(${this.scale})`;
        // this.ImageElement.style.transform = `scale(${this.scale})`;
        this.ImageElement.style.left = `${hShift}%`;
        this.ImageElement.style.top = `${vShift}%`;
        this.imagePositionLeft = hShift;
        this.imagePositionTop = vShift;
      } else {
        // this.ImageElement.style.transform = `translateX(${X}%) translateY(${Y}%) scale(${this.scale})`;

        this.ImageElement.style.left = `${hShift}%`;
        this.ImageElement.style.top = `${vShift}%`;
        this.imagePositionLeft = hShift;
        this.imagePositionTop = vShift;
      }
    }
  }

  // Calculate the new left/top values of an image
  private calcShift(conToImageRatio, containerSize, imageSize, focusSize: number, toMinus?, scale = 0) {
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
}
