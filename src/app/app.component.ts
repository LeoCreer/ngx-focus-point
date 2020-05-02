import { Component } from '@angular/core';
import { PositionModel } from './ngx-focus-point/models/position.model';
import { FormControl, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'NGX-Focus-Point';
  public position: PositionModel;
  public src: FormControl = new FormControl(
    'https://66.media.tumblr.com/8fd2436a90888b09af3c1eeefe8ef250/tumblr_p6ud1vgk6g1qjac96o1_1280.jpg',
  );
  public data: FormControl = new FormControl(JSON.stringify(this.position, null, 2));
  onChangeUpdatePosition($event: PositionModel) {
    console.log('ROOT',$event);
    this.position = $event;
    this.data.setValue(JSON.stringify(this.position, null, 2))
  }
  constructor() {
    console.log('ROOT',this.position);
  }
}
