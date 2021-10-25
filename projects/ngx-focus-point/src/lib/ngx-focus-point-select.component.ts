import { Component, ElementRef, Inject, Input, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { PositionModel } from './position.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-focus-point-select',
  templateUrl: './ngx-focus-point-select.component.html',
  styleUrls: ['./ngx-focus-point-select.component.scss'],
})
export class NgxFocusPointSelectComponent implements OnInit {
  @Input() src: any;
  @Input() selectPosition: Partial<PositionModel> = { x: 0.0, y: 0.0 };
  @Input() scale = 1;
  @Input() enableScale = false;
  @Output() change: Subject<PositionModel> = new Subject<PositionModel>();
  @Output() positionChange: Subject<PositionModel> = new Subject<PositionModel>();
  @ViewChild('img', { static: true }) ImageElementRef: ElementRef;
  private ImageElement: HTMLImageElement;
  private TempImageElement: HTMLImageElement = this.getDocument() ? document.createElement('img') : null;
  public scaleChange: Observable<any>;
  public form: FormGroup = new FormGroup({
    slider: new FormControl(0),
  });
  public focusPointAttr: PositionModel = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    s: 0,
  };

  public imageLoad$: Observable<any>;

  constructor() {}

  private getDocument() {
    try {
      return document;
    } catch (e) {
      return null;
    }
  }

  ngOnInit() {
    if (this.src && this.getDocument()) {
      this.TempImageElement.src = this.src;
      this.ImageElement = this.ImageElementRef.nativeElement;
      this.imageLoad$ = fromEvent(this.TempImageElement, 'load').pipe(
        tap((event) => {
          const imageW = this.ImageElement.clientWidth;
          const imageH = this.ImageElement.clientHeight;
          this.getCenter();
        }),
      );
      this.scaleChange = this.form.get('slider').valueChanges.pipe(
        tap((value) => {
          if (value / 1000 <= 1) {
            this.scale = 1;
          } else {
            this.scale = value / 1000;
          }
          this.positionChange.next({ ...this.focusPointAttr, s: this.scale });
        }),
      );
    }
  }

  public onClickFocus(e: MouseEvent) {
    const imageW = this.ImageElement.clientWidth;
    const imageH = this.ImageElement.clientHeight;
    let offsetX;
    let offsetY;
    if (e) {
      offsetX = e.offsetX - this.ImageElement.offsetLeft;
      offsetY = e.offsetY - this.ImageElement.offsetTop;
    } else {
      offsetX = 0.0 - this.ImageElement.offsetLeft;
      offsetY = 0.0 - this.ImageElement.offsetTop;
    }
    const focusX = (offsetX / imageW - 0.5) * 2;
    const focusY = (offsetY / imageH - 0.5) * -2;
    this.focusPointAttr.x = this.truncateDecimals(focusX, 2);
    this.focusPointAttr.y = this.truncateDecimals(focusY, 2);
    this.selectPosition.x = (offsetX / imageW) * 100;
    this.selectPosition.y = (offsetY / imageH) * 100;
    this.positionChange.next({ ...this.focusPointAttr, s: this.scale });
    this.change.next({ ...this.focusPointAttr, s: this.scale });
  }

  public getCenter() {
    const imageW = this.ImageElement.clientWidth;
    const imageH = this.ImageElement.clientHeight;
    const offsetX = imageW / 2 - this.ImageElement.offsetLeft;
    const offsetY = imageH / 2 - this.ImageElement.offsetTop;
    if (this.selectPosition) {
      this.selectPosition.x = (offsetX / imageW) * 100;
      this.selectPosition.y = (offsetY / imageH) * 100;
    } else {
      this.selectPosition.x = (offsetX / imageW) * 100;
      this.selectPosition.y = (offsetY / imageH) * 100;
    }
  }

  public truncateDecimals(number, digits) {
    const multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
    return truncatedNum / multiplier;
  }
}
