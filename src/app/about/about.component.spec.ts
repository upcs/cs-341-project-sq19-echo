import {TestBed, async} from '@angular/core/testing';
import {AboutComponent} from './about.component';
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MaterialModule} from "../../helpers/material.module";

describe('About Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [AboutComponent],
    }).compileComponents();
  }));

  test('should create about component properly', () => {
   const fixture = TestBed.createComponent(AboutComponent);
   const loginComponent = fixture.debugElement.componentInstance;
   expect(loginComponent).toBeTruthy();
  });
  test('should have a contact button', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('button').textContent)
      .toMatch('Contact');
  });
});
