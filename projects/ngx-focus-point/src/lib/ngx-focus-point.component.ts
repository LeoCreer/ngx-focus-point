import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OnResize } from './on-resize';


@Component({
  selector: 'ngx-focus-point',
  templateUrl: './ngx-focus-point.component.html',
  styleUrls: ['./ngx-focus-point.component.scss'],
})
export class NgxFocusPointComponent implements OnInit, OnDestroy, OnChanges {
  @Input() width?: string;
  @Input() height?: string;
  @Input() focusX = 0.0;
  @Input() focusY = 0.0;
  @Input() src?: string;
  @Input() animation = '1s';
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
  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.ComponentElements = this.elRef.nativeElement;
    this.ImageElement = this.ComponentElements.querySelector('img');
    this.ImageElement.classList.add('focus-point');
    this.ImageElement.style.cssText =
      'position: absolute;' +
      'left: 0;' +
      'top: 0;' +
      'margin: 0;' +
      'display: block;' +
      'width: auto;' +
      'height: auto;' +
      'min-width: 100%;' +
      'min-height: 100%;' +
      'max-height: none;' +
      'max-width: none;' +
      'backface-visibility: hidden;' +
      'transform: translate3d(0%, 0%, 0);' +
      'transition: left ' +
      `${this.animation}, top ` +
      `${this.animation}` +
      ' ease-in-out;';

    this.imageSubscription = fromEvent(this.ImageElement, 'load')
      .pipe(
        tap((event) => {
          this.imageHeight = this.ImageElement.offsetHeight;
          this.imageWidth = this.ImageElement.offsetWidth;
          this.adjustFocus();
        }),
      )
      .subscribe();

    const resize = new OnResize([this.ComponentElements]);
    this.resizeSub$ = fromEvent(resize.elements[0], 'resize')
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
      if(this.resizeSub$) {
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
        hShift = this.calcShift(hR, this.containerWidth, this.imageWidth, parseFloat(this.focusX.toString()));
      } else if (wR < hR) {
        vShift = this.calcShift(wR, this.containerHeight, this.imageHeight, parseFloat(this.focusY.toString()), true);
      }

      this.ImageElement.style.left = `${hShift}%`;
      this.ImageElement.style.top = `${vShift}%`;
      this.imagePositionLeft = hShift;
      this.imagePositionTop = vShift;
    }
  }

  // Calculate the new left/top values of an image
  private calcShift(conToImageRatio, containerSize, imageSize, focusSize: number, toMinus?) {
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
