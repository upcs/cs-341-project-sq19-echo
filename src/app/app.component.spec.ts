import {TestBed, async} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {RouterTestingModule} from "@angular/router/testing";
import {MDBBootstrapModule} from "angular-bootstrap-md";

describe('App Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MDBBootstrapModule.forRoot(), RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();
  }));

  test('should create app component properly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
