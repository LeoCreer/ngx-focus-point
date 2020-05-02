import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PositionModel } from '../../models/position.model';

@Component({
  selector: 'ngx-focus-point-select',
  templateUrl: './ngx-focus-point-select.component.html',
  styleUrls: ['./ngx-focus-point-select.component.scss'],
})
export class NgxFocusPointSelectComponent implements OnInit {
  @Input() src: any;
  @Input() selectPosition: Partial<PositionModel> = { x: 0.0, y: 0.0 };
  @Output() change: BehaviorSubject<PositionModel> = new BehaviorSubject<PositionModel>(
    this.selectPosition as PositionModel,
  );
  @ViewChild('img', { static: true }) ImageElementRef: ElementRef;
  private ImageElement: HTMLImageElement;
  private TempImageElement: HTMLImageElement = document.createElement('img');
  public focusPointAttr: PositionModel = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };

  public imageLoad$: Observable<any>;

  constructor() {}

  ngOnInit() {
    this.TempImageElement.src = this.src;
    console.log(this.ImageElementRef);
    this.ImageElement = this.ImageElementRef.nativeElement;
    this.imageLoad$ = fromEvent(this.TempImageElement, 'load').pipe(
      tap((event) => {
        this.focusPointAttr.h = this.TempImageElement.height;
        this.focusPointAttr.w = this.TempImageElement.width;
        this.getCenter();
      }),
    );
  }

  public onClickFocus(e: MouseEvent) {
    let imageW = this.ImageElement.clientWidth;
    let imageH = this.ImageElement.clientHeight;
    let offsetX;
    let offsetY;
    if (e) {
      offsetX = e.offsetX - this.ImageElement.offsetLeft;
      offsetY = e.offsetY - this.ImageElement.offsetTop;
    } else {
      offsetX = 0.0 - this.ImageElement.offsetLeft;
      offsetY = 0.0 - this.ImageElement.offsetTop;
    }
    let focusX = (offsetX / imageW - 0.5) * 2;
    let focusY = (offsetY / imageH - 0.5) * -2;
    this.focusPointAttr.x = this.truncateDecimals(focusX, 2);
    this.focusPointAttr.y = this.truncateDecimals(focusY, 2);
    this.selectPosition.x = (offsetX / imageW) * 100;
    this.selectPosition.y = (offsetY / imageH) * 100;
    this.change.next(this.focusPointAttr);
  }

  public getCenter() {
    let imageW = this.ImageElement.clientWidth;
    let imageH = this.ImageElement.clientHeight;
    let offsetX = imageW / 2 - this.ImageElement.offsetLeft;
    let offsetY = imageH / 2 - this.ImageElement.offsetTop;
    this.selectPosition.x = (offsetX / imageW) * 100;
    this.selectPosition.y = (offsetY / imageH) * 100;
    this.change.next(this.focusPointAttr);
  }

  public truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
  }
}
