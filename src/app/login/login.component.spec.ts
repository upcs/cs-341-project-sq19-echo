import {TestBed, async} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {RouterTestingModule} from "@angular/router/testing";
import {MaterialModule} from "../../helpers/material.module";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('Login Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MaterialModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
      declarations: [LoginComponent],
    }).compileComponents();
  }));

  test('should create login component properly', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const loginComponent = fixture.debugElement.componentInstance;
    expect(loginComponent).toBeTruthy();
  });

  test('should have password recovery option', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('a').textContent)
      .toEqual('Forgot Password?');
  });
});
