import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormControl, Validators, MinLengthValidator} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public constructor(private titleService: Title) {
    titleService.setTitle("Login Page");
  }

  email = new FormControl('', [Validators.required, Validators.email]);
  getEmailError() {
    return this.email.hasError('required') ? 'You must enter an email' :
        this.email.hasError('email') ? 'Not a valid email' : '';
  }

  password = new FormControl('', [Validators.required]);
  getPasswordError() {
    return this.password.hasError('required') ? 'You must enter a password' : '';
  }

  setPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  getSetError() {
    return this.setPassword.hasError('required') ? 'You must enter a password' :
        this.setPassword.hasError('minlength') ? 'Password must have 8 or more characters' : '';
  }

}
