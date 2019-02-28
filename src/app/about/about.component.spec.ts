import {TestBed, async} from '@angular/core/testing';
import {AboutComponent} from './about.component';
import {RouterTestingModule} from "@angular/router/testing";

describe('About Tests', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AboutComponent],
    }).compileComponents();
  }));

  //test('should create about component properly', () => {
  //  const fixture = TestBed.createComponent(AboutComponent);
 //   const loginComponent = fixture.debugElement.componentInstance;
  //  expect(loginComponent).toBeTruthy();
  //});

 // test('should have proper heading', () => {
  //  const fixture = TestBed.createComponent(AboutComponent);
  //  fixture.detectChanges();
 //  const compiled = fixture.debugElement.nativeElement;
  //  expect(compiled.querySelector('h1').textContent)
  //    .toContain('Our about page!');
 // });
});
