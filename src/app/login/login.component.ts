import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

interface SignUpControls {
  readonly email: FormControl;
  readonly password: FormControl;
  readonly confirmPassword: FormControl;
}

interface LoginControls {
  readonly email: FormControl;
  readonly password: FormControl;
}

/**
 * Citation: https://stackoverflow.com/questions/31788681/angular2-validator-which-relies-on-multiple-form-fields
 */
function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): {[key: string]: any} => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      return {mismatchedPasswords: true};
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  MIN_PASSWORD_LENGTH = 8;

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

  public constructor(private titleService: Title, private formBuilder: FormBuilder) {
    titleService.setTitle("Login Page");

    this.signupForm = this.formBuilder.group(
      this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
    );
    this.loginForm = this.formBuilder.group(this.loginControls);
  }

  signUp() {
    let setPass: HTMLInputElement = <HTMLInputElement>document.getElementById("setPass");
    let setEmail: HTMLInputElement = <HTMLInputElement>document.getElementById("setEmail");
    if (this.json.hasOwnProperty(setEmail.value)) {
      alert("Error, an account has already been created with this email.")
    } else if (!this.confirm.invalid) {
      this.json[setEmail.value] = setPass.value;
      alert("Success!");
    }
  }

  getFormError(formControl: FormControl): string {
    console.log(formControl.errors);
    if (formControl.hasError('required')) {
      return 'This field is required.';
    }

    if (formControl.hasError('email')) {
      return 'Valid email is required.';
    }

    if (formControl.hasError('minlength')) {
      return `Minimum password length of ${this.MIN_PASSWORD_LENGTH} required.`;
    }
  }

  login(): void {
    let logEmail: HTMLInputElement = <HTMLInputElement>document.getElementById("logEmail");
    let logPass: HTMLInputElement = <HTMLInputElement>document.getElementById("logPass");
  }
}
