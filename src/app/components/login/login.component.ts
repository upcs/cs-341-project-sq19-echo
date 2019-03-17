import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {sha512} from 'js-sha512';
import {CookieService} from 'ngx-cookie-service';
import {LoginControls, SignUpControls} from './login.component.interfaces';
import {matchingPasswords} from './login.component.functions';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  MIN_PASSWORD_LENGTH = 8;
  userAccounts: {[email: string]: string} = {};

  signupControls: SignUpControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
    confirmPassword: new FormControl('', [Validators.required])
  };

  loginControls: LoginControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  };

  signupForm: FormGroup;
  loginForm: FormGroup;

  public constructor(private titleService: Title, private formBuilder: FormBuilder, private cookie: CookieService) {
    titleService.setTitle('Login Page');

    this.signupForm = this.formBuilder.group(
      this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
    );
    this.loginForm = this.formBuilder.group(this.loginControls);
  }

  signUp(): void {
    const email = this.signupControls.email.value;

    if (this.userAccounts.hasOwnProperty(email)) {
      alert('An account has already been created with this email.');
      return;
    }

    this.userAccounts[email] = sha512(this.signupControls.password.value);

    alert(`Account created with email: ${email}.`);
  }

  getFormError(formControl: FormControl): string {
    if (formControl.hasError('required')) {
      return 'This field is required.';
    }

    if (formControl.hasError('email')) {
      return 'Valid email is required.';
    }

    if (formControl.hasError('minlength')) {
      return `Minimum password length of ${this.MIN_PASSWORD_LENGTH} required.`;
    }

    return '';
  }

  login(): void {
    const email = this.loginControls.email.value;
    const hashedPassword = sha512(this.loginControls.password.value);

    if (this.userAccounts[email] === hashedPassword) {
      this.cookie.set('authenticated', email);
      alert(`User with email ${email} successfully logged in.`);
    }
  }
}
