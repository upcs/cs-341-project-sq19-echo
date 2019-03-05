import {FormControl} from '@angular/forms';

export interface SignUpControls {
  readonly email: FormControl;
  readonly password: FormControl;
  readonly confirmPassword: FormControl;
}

export interface LoginControls {
  readonly email: FormControl;
  readonly password: FormControl;
}
