import { Component, OnDestroy, OnInit } from '@angular/core';
import { PositionModel } from './ngx-focus-point/models/position.model';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'NGX-Focus-Point';
  public position: PositionModel;
  public routes$: Subscription;
  public src: UntypedFormControl = new UntypedFormControl(null);
  public data: UntypedFormControl;
  public preset = {x: -0.39, y: 0.13, w: 0, h: 0, s: 1};

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.data = new UntypedFormControl(JSON.stringify(this.position, null, 2));
    this.routes$ = this.route.queryParams
      .pipe(
        tap((params) => {
          this.src.setValue(
            params.hasOwnProperty('src')
              ? params.src.toString()
              : 'https://66.media.tumblr.com/8fd2436a90888b09af3c1eeefe8ef250/tumblr_p6ud1vgk6g1qjac96o1_1280.jpg',
          );

          // setTimeout(() => {
          //   this.src.setValue('https://www.boredpanda.com/blog/wp-content/uploads/2018/03/The-artist-spent-the-last-decade-composing-one-image-per-day-5aaa29f3771ed__880.jpg')
          // }, 9000)
        }),
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.routes$.unsubscribe();
  }

  public onChangeUpdatePosition($event: PositionModel) {
    console.log('event', $event);
    this.position = $event;
    if (this.data) {
      this.data.setValue(JSON.stringify(this.position, null, 2));
    }
  }
}
