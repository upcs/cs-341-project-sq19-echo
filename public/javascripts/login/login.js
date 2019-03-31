$(document).ready(function () {
   $('#navBar').html(this.getNavBarHtml('login'));
});
/*
import {sha512} from 'js-sha512';
import {matchingPasswords} from './login.functions';

export class Login {
    MIN_PASSWORD_LENGTH = 8;
    userAccounts = {};

    signupControls = {
        email: null,
        password: null,
        confirmPassword: null
    };

    loginControls = {
        email: null,
        password: null
    };

    signupForm;
    loginForm;

    constructor(titleService, formBuilder, cookie) {
        titleService.setTitle('Login Page');

        this.signupForm = formBuilder.group(
            this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
        );
        this.loginForm = formBuilder.group(this.loginControls);
    }

    signUp() {
        const email = this.signupControls.email.value;

        if (this.userAccounts.hasOwnProperty(email)) {
            alert('An account has already been created with this email.');
            return;
        }

        this.userAccounts[email] = sha512(this.signupControls.password.value);

        alert(`Account created with email: ${email}.`);
    }

    getFormError(formControl) {
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

    login() {
        const email = this.loginControls.email.value;
        const hashedPassword = sha512(this.loginControls.password.value);

        if (this.userAccounts[email] === hashedPassword) {
            this.cookie.set('authenticated', email);
            alert(`User with email ${email} successfully logged in.`);
        }
    }
}
 */
