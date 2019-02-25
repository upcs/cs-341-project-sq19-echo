import {TestBed, async} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {RouterTestingModule} from "@angular/router/testing";
import {MDBBootstrapModule} from "angular-bootstrap-md";

// Mock the CookieService
import {CookieService} from 'ngx-cookie-service';
jest.genMockFromModule('ngx-cookie-service');

describe('App Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MDBBootstrapModule.forRoot(), RouterTestingModule],
      providers: [CookieService],
      declarations: [AppComponent],
    }).compileComponents();
  }));

  test('should create app component properly', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
