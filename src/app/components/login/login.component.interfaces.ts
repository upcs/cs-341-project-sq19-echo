import {FormControl} from '@angular/forms';

export interface ISignUpControls {
  readonly email: FormControl;
  readonly password: FormControl;
  readonly confirmPassword: FormControl;
  readonly questionRequire: FormControl;
  readonly answerRequire: FormControl;
}

export interface ILoginControls {
  readonly email: FormControl;
  readonly password: FormControl;
}

export interface IResetControls {
  readonly emailReset: FormControl;
  readonly passwordReset: FormControl;
  readonly answerReset: FormControl;
}
