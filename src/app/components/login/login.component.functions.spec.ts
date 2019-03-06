import {matchingPasswords} from './login.component.functions';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

describe('matchingPasswords tests', () => {
  const PASSWORD_KEY = 'password';
  const CONFIRM_PASSWORD_KEY = 'confirmPassword';

  const mismatchedPasswordsObject = {mismatchedPasswords: true};
  const matchingPasswordsFunction = matchingPasswords(PASSWORD_KEY, CONFIRM_PASSWORD_KEY);

  const testFormGroup: FormGroup = new FormBuilder().group({
    email: new FormControl(),
    password: new FormControl(),
    confirmPassword: new FormControl()
  });

  test('matching passwords "qwerty" result in an empty object', () => {
    testFormGroup.controls[PASSWORD_KEY].setValue('qwerty');
    testFormGroup.controls[CONFIRM_PASSWORD_KEY].setValue('qwerty');

    expect(matchingPasswordsFunction(testFormGroup)).toEqual({});
  });

  test('null or undefined password should result in mismatched passwords', () => {
    testFormGroup.controls[CONFIRM_PASSWORD_KEY].setValue('asd');

    testFormGroup.controls[PASSWORD_KEY].setValue(null);
    expect(matchingPasswordsFunction(testFormGroup)).toEqual(mismatchedPasswordsObject);

    testFormGroup.controls[PASSWORD_KEY].setValue(undefined);
    expect(matchingPasswordsFunction(testFormGroup)).toEqual(mismatchedPasswordsObject);
  });

  test('null or undefined confirmed password should result in mismatched passwords', () => {
    testFormGroup.controls[PASSWORD_KEY].setValue('qwerty');

    testFormGroup.controls[CONFIRM_PASSWORD_KEY].setValue(null);
    expect(matchingPasswordsFunction(testFormGroup)).toEqual(mismatchedPasswordsObject);

    testFormGroup.controls[CONFIRM_PASSWORD_KEY].setValue(undefined);
    expect(matchingPasswordsFunction(testFormGroup)).toEqual(mismatchedPasswordsObject);
  });

  test('passwords "as" and "ash" result in mismatched passwords', () => {
    testFormGroup.controls[PASSWORD_KEY].setValue('as');
    testFormGroup.controls[CONFIRM_PASSWORD_KEY].setValue('ash');

    expect(matchingPasswordsFunction(testFormGroup)).toEqual(mismatchedPasswordsObject);
  });
});
