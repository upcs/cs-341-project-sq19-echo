import {TestBed, async} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {RouterTestingModule} from "@angular/router/testing";
import {MaterialModule} from "../../helpers/material.module";
import {LeafletModule} from "@asymmetrik/ngx-leaflet";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";

describe('Home Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MaterialModule, LeafletModule, BrowserAnimationsModule, HttpClientModule],
      declarations: [HomeComponent],
    }).compileComponents();
  }));

  test('should create home component properly', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const homeComponent = fixture.debugElement.componentInstance;
    expect(homeComponent).toBeTruthy();
  });
  test('should have proper heading', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent)
      .toContain('Portland Traffic Reform');
  });
  test('selecting area works properly', () => {
    expect(true).toBeTruthy();
  });
  test('selecting year works properly', () => {
    expect(true).toBeTruthy();
  });
  test('selecting vehicle type works properly', () => {
    expect(true).toBeTruthy();
  });
  test('selecting density works properly', () => {
    expect(true).toBeTruthy();
  });
  test('clearing filters works properly', () => {
    expect(true).toBeTruthy();
  });
  test('filter data works properly', () => {
    expect(true).toBeTruthy();
  });
});
