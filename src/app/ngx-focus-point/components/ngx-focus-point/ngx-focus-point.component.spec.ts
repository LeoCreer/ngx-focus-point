import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NgxFocusPointComponent } from "./ngx-focus-point.component";

describe("NgxFocusPointComponent", () => {
  let component: NgxFocusPointComponent;
  let fixture: ComponentFixture<NgxFocusPointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxFocusPointComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFocusPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
