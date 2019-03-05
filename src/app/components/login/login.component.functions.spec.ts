import {matchingPasswords} from './login.component.functions';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SignUpControls} from './login.component.interfaces';

describe('matchingPasswords tests', () => {
  const PASSWORD_KEY = 'password';
  const CONFIRM_PASSWORD_KEY = 'confirmPassword';

  const MISMATCHED_PASSWORDS_OBJECT = {mismatchedPasswords: true};

  let testForm: FormGroup;
  const matchingPasswordsFunction = matchingPasswords(PASSWORD_KEY, CONFIRM_PASSWORD_KEY);

  const testSignUpControls: SignUpControls = {
    email: new FormControl(),
    password: new FormControl(),
    confirmPassword: new FormControl()
  };

  beforeAll(() => {
    testForm = new FormBuilder().group(
      testSignUpControls, {validator: matchingPasswordsFunction}
    );
  });

  test('matching passwords "qwerty" result in an empty object', () => {
    testForm.controls[PASSWORD_KEY].setValue('qwerty');
    testForm.controls[CONFIRM_PASSWORD_KEY].setValue('qwerty');

    expect(matchingPasswordsFunction(testForm)).toEqual({});
  });

  test('null or undefined password should result in mismatched passwords', () => {
    testForm.controls[CONFIRM_PASSWORD_KEY].setValue('asd');

    testForm.controls[PASSWORD_KEY].setValue(null);
    expect(matchingPasswordsFunction(testForm)).toEqual(MISMATCHED_PASSWORDS_OBJECT);

    testForm.controls[PASSWORD_KEY].setValue(undefined);
    expect(matchingPasswordsFunction(testForm)).toEqual(MISMATCHED_PASSWORDS_OBJECT);
  });

  test('null or undefined confirmed password should result in mismatched passwords', () => {
    testForm.controls[PASSWORD_KEY].setValue('qwerty');

    testForm.controls[CONFIRM_PASSWORD_KEY].setValue(null);
    expect(matchingPasswordsFunction(testForm)).toEqual(MISMATCHED_PASSWORDS_OBJECT);

    testForm.controls[CONFIRM_PASSWORD_KEY].setValue(undefined);
    expect(matchingPasswordsFunction(testForm)).toEqual(MISMATCHED_PASSWORDS_OBJECT);
  });

  test('passwords "as" and "ash" result in mismatched passwords', () => {
    testForm.controls[PASSWORD_KEY].setValue('as');
    testForm.controls[CONFIRM_PASSWORD_KEY].setValue('ash');

    expect(matchingPasswordsFunction(testForm)).toEqual(MISMATCHED_PASSWORDS_OBJECT);
  });
});
