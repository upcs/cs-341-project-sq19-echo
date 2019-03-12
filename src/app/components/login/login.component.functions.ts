import {FormGroup} from '@angular/forms';

/**
 * Citation: https://stackoverflow.com/questions/31788681/angular2-validator-which-relies-on-multiple-form-fields
 */
export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): {[key: string]: boolean} => {
    const password = group.controls[passwordKey];
    const confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      return {mismatchedPasswords: true};
    }
    return {};
  };
}
