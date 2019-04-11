import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {sha512} from 'js-sha512';
import {CookieService} from 'ngx-cookie-service';
import {LoginControls, SignUpControls, ResetControls} from './login.component.interfaces';
import {matchingPasswords} from './login.component.functions';
import {HttpClient} from '@angular/common/http';
import {displayGeneralErrorMessage} from '../../../helpers/error.functions';


@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private MIN_PASSWORD_LENGTH = 8;
  public SECURITY_QUESTIONS: string[] = [
    'What was the last name of your third grade teacher?',
    'What street did you live on in third grade?',
    'What was your childhood nickname',
    'What is the name of your favorite childhood friend?',
    'In what city does your nearest sibling live?'
  ];

  public signupControls: SignUpControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
    confirmPassword: new FormControl('', [Validators.required]),
    questionRequire: new FormControl('', [Validators.required]),
    answerRequire: new FormControl('', [Validators.required])
  };

  public loginControls: LoginControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  };

  public resetControls: ResetControls = {
    emailReset: new FormControl('', [Validators.required, Validators.email]),
    passwordReset: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
    answerReset: new FormControl('', [Validators.required])
  };

  public signupForm: FormGroup;
  public loginForm: FormGroup;
  public resetForm: FormGroup;

  public loggedOut = false;

  public constructor(
    private titleService: Title,
    private formBuilder: FormBuilder,
    private cookie: CookieService,
    private http: HttpClient
  ) {
    titleService.setTitle('Login Page');

    this.signupForm = this.formBuilder.group(
      this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
    );
    this.loginForm = this.formBuilder.group(this.loginControls);
    this.resetForm = this.formBuilder.group(this.resetControls);
  }

  public signUp(): void {
    const email = this.signupControls.email.value;
    const hashedPassword = sha512(this.signupControls.password.value);

    const question = this.signupControls.questionRequire.value;
    const hashedAnswer = sha512(this.signupControls.answerRequire.value.toLowerCase());

    this.http.post('/api', {command: `SELECT * FROM users WHERE user='${email}'`}).subscribe((data: any[]) => {
        if (data.length > 0) {
          alert('An account has already been created with this email.');
          return;
        }

        this.http.post(
          '/api',
          {
            command: `INSERT INTO users (user, password, question, answer)
                      VALUES ('${email}', '${hashedPassword}', '${question}', '${hashedAnswer}')`
          }).subscribe(() => {
            alert(`Account created with email: ${email}.`);
            this.signupForm.reset();
          }, () => displayGeneralErrorMessage()
        );
      }, () => displayGeneralErrorMessage()
    );
  }

  public getFormError(formControl: FormControl): string {
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

  public login(): void {
    const email = this.loginControls.email.value;
    const hashedPassword = sha512(this.loginControls.password.value);

    const command = 'select * from users where user=\'' + email + '\'';
    this.http.post('/api', {command}).subscribe((data: any[]) => {
      if (data.length && data[0].password === hashedPassword) {
        this.cookie.set('authenticated', email);
        this.loginForm.reset();
        this.loggedOut = false;
        alert(`User with email ${email} successfully logged in.`);
        return;
      }

      alert('Email or password is incorrect');
    }, () => displayGeneralErrorMessage()
    );
  }

  public continueReset(): void {
    this.http.post(
      '/api', {command: `SELECT * FROM users WHERE user='${this.resetControls.emailReset.value}'`}
      ).subscribe((data: any[]) => {
        if (data.length === 0) {
          alert('No user with that email was found');
          return;
        }

        document.getElementById('emailHide').style.display = 'none';
        document.getElementById('continue').style.display = 'none';
        document.getElementById('answerHide').style.display = 'block';
        document.getElementById('passwordHide').style.display = 'block';
        document.getElementById('resetButton').style.display = 'block';
        document.getElementById('resetQuestion').style.display = 'block';
        document.getElementById('resetQuestion').textContent = data[0].question;
      }, () => displayGeneralErrorMessage()
    );
  }

  public resetPass(): void {
    const email = this.resetControls.emailReset.value;
    const hashedPassword = sha512(this.resetControls.passwordReset.value);
    const hashedAnswer = sha512(this.resetControls.answerReset.value.toLowerCase());

    this.http.post('/api', {command: `SELECT * FROM users WHERE user='${email}'`}).subscribe((data: any[]) => {
        if (hashedAnswer !== data[0].answer) {
          alert('Incorrect Answer');
          return;
        }

        this.http.post(
          '/api',
          {
            command: `REPLACE INTO users VALUES ('${email}', '${hashedPassword}', '${data[0].question}', '${data[0].answer}')`
          }).subscribe(() => {
            alert('Password was reset');
            document.getElementById('emailHide').style.display = 'block';
            document.getElementById('continue').style.display = 'block';
            document.getElementById('answerHide').style.display = 'none';
            document.getElementById('passwordHide').style.display = 'none';
            document.getElementById('resetButton').style.display = 'none';
            document.getElementById('resetQuestion').style.display = 'none';
            document.getElementById('resetQuestion').textContent = '';
            this.resetForm.reset();
          }, () => displayGeneralErrorMessage()
        );
      }, () => displayGeneralErrorMessage()
    );
  }
}
