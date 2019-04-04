import {FormControl} from '@angular/forms';

export interface SignUpControls {
  readonly email: FormControl;
  readonly password: FormControl;
  readonly confirmPassword: FormControl;
  readonly questionRequire: FormControl;
  readonly answerRequire: FormControl;
}

export interface LoginControls {
  readonly email: FormControl;
  readonly password: FormControl;
}

export interface ResetControls {
  readonly emailReset: FormControl;
  readonly passwordReset: FormControl;
  readonly answerReset: FormControl;
}
