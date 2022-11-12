import {Component, ElementRef, Input, OnInit, Output} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {PositionModel} from '../../models/position.model';
import {FormControl, FormGroup} from '@angular/forms';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'ngx-focus-point-select',
  templateUrl: './ngx-focus-point-select.component.html',
  styleUrls: ['./ngx-focus-point-select.component.scss'],
})
export class NgxFocusPointSelectComponent implements OnInit {
  @Input() src: any;
  @Input() selectPosition: Partial<PositionModel> = {x: 0.0, y: 0.0};
  @Input() scale = 1;
  @Input() enableScale = false;
  @Output() positionChange: Subject<PositionModel> = new Subject<PositionModel>();
  public scaleChange: Observable<any> | undefined;
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
  public imageLoad$: Observable<any> | undefined;
  private ComponentElements: HTMLElement | undefined;
  private MediaElement: HTMLImageElement | HTMLVideoElement | undefined;
  private TempImageElement: HTMLImageElement | undefined;

  constructor(private platformSvc: PlatformService, private elRef: ElementRef) {
  }

  ngOnInit() {
    if (this.platformSvc.isPlatformBrowser && this.src) {
      this.TempImageElement = document.createElement('img');
      this.ComponentElements = this.elRef.nativeElement;
      this.MediaElement = this.ComponentElements?.querySelector(
        'img'
      ) as HTMLImageElement;
      this.TempImageElement.src = this.src;

      this.imageLoad$ = fromEvent(this.TempImageElement, 'load').pipe(
        tap((event) => {
          const imageW = this.MediaElement?.clientWidth;
          const imageH = this.MediaElement?.clientHeight;
          this.getCenter();
        }),
      );
      this.scaleChange = this.form.controls['slider'].valueChanges.pipe(
        tap((value) => {
          if (value / 1000 <= 1) {
            this.scale = 1;
          } else {
            this.scale = value / 1000;
          }
          this.positionChange.next({...this.focusPointAttr, s: this.scale});
        }),
      );
    }
  }

  public onClickFocus(e: MouseEvent) {
    const imageW = this.MediaElement?.clientWidth as number;
    const imageH = this.MediaElement?.clientHeight as number;
    let offsetX;
    let offsetY;
    if (e) {
      offsetX = e.offsetX - (this.MediaElement as HTMLElement).offsetLeft;
      offsetY = e.offsetY - (this.MediaElement as HTMLElement).offsetTop;
    } else {
      offsetX = 0.0 - (this.MediaElement as HTMLElement).offsetLeft;
      offsetY = 0.0 - (this.MediaElement as HTMLElement).offsetTop;
    }
    const focusX = (offsetX / imageW - 0.5) * 2;
    const focusY = (offsetY / imageH - 0.5) * -2;
    this.focusPointAttr.x = this.truncateDecimals(focusX, 2);
    this.focusPointAttr.y = this.truncateDecimals(focusY, 2);
    this.selectPosition.x = (offsetX / imageW) * 100;
    this.selectPosition.y = (offsetY / imageH) * 100;
    this.positionChange.next({...this.focusPointAttr, s: this.scale});
  }

  public getCenter() {
    const imageW = (this.MediaElement as HTMLElement).clientWidth;
    const imageH = (this.MediaElement as HTMLElement).clientHeight;
    const offsetX = imageW / 2 - (this.MediaElement as HTMLElement).offsetLeft;
    const offsetY = imageH / 2 - (this.MediaElement as HTMLElement).offsetTop;
    this.selectPosition.x = (offsetX / imageW) * 100;
    this.selectPosition.y = (offsetY / imageH) * 100;
  }

  public truncateDecimals(num: number, digits: number) {
    const multiplier = Math.pow(10, digits);
    const adjustedNum = num * multiplier;
    const truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
    return truncatedNum / multiplier;
  }
}
