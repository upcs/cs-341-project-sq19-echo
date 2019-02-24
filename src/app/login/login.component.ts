import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormControl, Validators, MinLengthValidator} from '@angular/forms';
import data from './users.json';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  match: number = 0;
  json: any = data;
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

  confirm = new FormControl('', [Validators.required, Validators.minLength(this.match)]);
  getConfirmError() {
    return this.confirm.hasError('required') ? 'You must re-enter your password' :
        this.confirm.hasError('minlength') ? 'Passwords do not match' : '';
  }

  setPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  getSetError() {
    return this.setPassword.hasError('required') ? 'You must enter a password' :
        this.setPassword.hasError('minlength') ? 'Password must have 8 or more characters' : '';
  }

  signUpReturn(event) {
    if(event.keyCode == 13) {
      this.signUp();
    }
  }

  signUp() {
    var setPass: HTMLInputElement = <HTMLInputElement>document.getElementById("setPass");
    var setEmail: HTMLInputElement = <HTMLInputElement>document.getElementById("setEmail");
    if(this.json.hasOwnProperty(setEmail.value)) {
      alert("Error, an account has already been created with this email.")
    }
    else if(!this.confirm.invalid) {
      this.json[setEmail.value] = setPass.value;
      alert("Success!");
    }
  }

  login() {
    var logEmail: HTMLInputElement = <HTMLInputElement>document.getElementById("logEmail");
    var logPass: HTMLInputElement = <HTMLInputElement>document.getElementById("logPass");

    if(this.json[logEmail.value] === logPass.value) {
      alert("Logged in!");
    }
  }

  confirmPasswords() {
    var setPass: HTMLInputElement = <HTMLInputElement>document.getElementById("setPass");
    var confirmPass: HTMLInputElement = <HTMLInputElement>document.getElementById("confirmPass");

    if(setPass.value === confirmPass.value) {
      this.confirm.setValidators([Validators.required, Validators.minLength(0)]);
      this.confirm.updateValueAndValidity();
    }
    else {
      this.confirm.setValidators([Validators.required, Validators.minLength(1000)]);
      this.confirm.updateValueAndValidity();
    }
  }

}
