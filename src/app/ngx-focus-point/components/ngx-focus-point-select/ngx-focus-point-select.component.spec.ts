import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NgxFocusPointSelectComponent } from "./ngx-focus-point-select.component";

describe("NgxFocusPointSelectComponent", () => {
  let component: NgxFocusPointSelectComponent;
  let fixture: ComponentFixture<NgxFocusPointSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxFocusPointSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFocusPointSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
