import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {sha512} from 'js-sha512';
import {CookieService} from 'ngx-cookie-service';
import {ILoginControls, ISignUpControls, IResetControls, IUser, ISave} from './login.component.interfaces';
import {getSqlSelectUserCommand, matchingPasswords} from './login.component.functions';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

import {displayGeneralErrorMessage, getSqlSelectCommand} from '../../../helpers/helpers.functions';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public passwordResetInProgress = false;

  private MIN_PASSWORD_LENGTH = 8;
  public savedData: ISave[] = [];

  public SECURITY_QUESTIONS: string[] = [
    'What was the last name of your third grade teacher?',
    'What street did you live on in third grade?',
    'What was your childhood nickname?',
    'What is the name of your favorite childhood friend?',
    'In what city does your nearest sibling live?'
  ];

  public signupControls: ISignUpControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
    confirmPassword: new FormControl('', [Validators.required]),
    questionRequire: new FormControl('', [Validators.required]),
    answerRequire: new FormControl('', [Validators.required])
  };

  public loginControls: ILoginControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  };

  public resetControls: IResetControls = {
    emailReset: new FormControl('', [Validators.required, Validators.email]),
    passwordReset: new FormControl('', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]),
    answerReset: new FormControl('', [Validators.required])
  };

  public signupForm: FormGroup;
  public loginForm: FormGroup;
  public resetForm: FormGroup;
  public resetQuestionTextContent: string;

  public constructor(
    private titleService: Title,
    private formBuilder: FormBuilder,
    private cookie: CookieService,
    private http: HttpClient,
    private router: Router
  ) {
    titleService.setTitle('Login Page');

    this.signupForm = this.formBuilder.group(
      this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
    );
    this.loginForm = this.formBuilder.group(this.loginControls);
    this.resetForm = this.formBuilder.group(this.resetControls);

    if (this.cookie.check('authenticated')) {
      this.loadSavedAddresses();
    }
  }

  ngOnInit(): void {
    if (this.cookie.check('authenticated')) {
      document.getElementById('bigCard').style.display = 'none';
      document.getElementById('logoutCard').style.display = 'block';
    } else {
      document.getElementById('bigCard').style.display = 'block';
      document.getElementById('logoutCard').style.display = 'none';
    }
  }

  public signUp(): void {
    const unhashedEmail = this.signupControls.email.value;
    const email = sha512(this.signupControls.email.value);
    const password = sha512(this.signupControls.password.value);
    const question = this.signupControls.questionRequire.value;
    const answer = sha512(this.signupControls.answerRequire.value.toLowerCase());

    this.http.post('/api', {command: getSqlSelectUserCommand(email)}).subscribe((users: IUser[]) => {
      if (users.length) {
        alert('An account has already been created with this email.');
        return;
      }

      this.http.post(
        '/api',
        {
          command: `INSERT INTO users (user, password, question, answer)
                    VALUES ('${email}', '${password}', '${question}', '${answer}')`
        }).subscribe(() => {
        alert(`Account created with email: ${unhashedEmail}.`);
        this.router.navigateByUrl('/about', {skipLocationChange: true})
          .then(() => this.router.navigate(['user']));
        return;
      }, () => displayGeneralErrorMessage());
    }, () => displayGeneralErrorMessage());
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
    const hashedEmail = sha512(email);
    const hashedPassword = sha512(this.loginControls.password.value);

    this.http.post('/api', {command: getSqlSelectUserCommand(hashedEmail)}).subscribe((users: IUser[]) => {
        if (users.length && users[0].password === hashedPassword) {
          this.cookie.set('authenticated', email);
          location.href = '/home';
          return;
        }

        alert('Email or password is incorrect');
      }, () => displayGeneralErrorMessage()
    );
  }

  public promptUserWithSecurityQuestion(): void {
    const email = sha512(this.resetControls.emailReset.value);
    this.http.post(
      '/api', {command: getSqlSelectUserCommand(email)}
    ).subscribe((users: IUser[]) => {
        if (!users.length) {
          alert('No user with that email was found.');
          return;
        }

        this.passwordResetInProgress = true;
        this.resetQuestionTextContent = users[0].question;
      }, () => displayGeneralErrorMessage()
    );
  }

  public validateEnteredSecurityAnswer(): void {
    const email = sha512(this.resetControls.emailReset.value);
    const hashedPassword = sha512(this.resetControls.passwordReset.value);
    const hashedAnswer = sha512(this.resetControls.answerReset.value.toLowerCase());

    this.http.post('/api', {command: getSqlSelectUserCommand(email)}).subscribe((users: IUser[]) => {
        if (hashedAnswer !== users[0].answer) {
          alert('Incorrect Answer');
          return;
        }

        this.http.post(
          '/api',
          {
            command: `REPLACE INTO users VALUES ('${email}', '${hashedPassword}', '${users[0].question}', '${users[0].answer}')`
          }).subscribe(() => {
            alert('Password was reset');
            this.passwordResetInProgress = false;
            this.router.navigateByUrl('/about', {skipLocationChange: true})
              .then(() => this.router.navigate(['user']));
            return;
          }, () => displayGeneralErrorMessage()
        );
      }, () => displayGeneralErrorMessage()
    );
  }

  public loadSavedAddresses(): void {
    const user = sha512(this.cookie.get('authenticated'));
    this.http.post('/api', {
      command: getSqlSelectCommand({whatToSelect: '*', tableToSelectFrom: 'saves', whereStatements: [`user='${user}'`]})
    }).subscribe((saves: ISave[]) => {
      if (saves.length) {
        for (const save of saves) {
          this.savedData.push({address: save.address, level: save.level, volume: save.volume});
        }
      }
    }, () => displayGeneralErrorMessage());
  }

  public removeSave(address: string): void {
    const command = `DELETE FROM saves WHERE address='${address}'`;
    this.http.post('/api', {command}).subscribe(() => {
        this.router.navigateByUrl('/about', {skipLocationChange: true})
          .then(() => this.router.navigate(['user']));
      }, () => displayGeneralErrorMessage()
    );
  }

  public viewOnMap(address: string): void {
    this.cookie.set('address', address);
    this.router.navigate(['home']);
  }

  public logout(): void {
    this.cookie.delete('authenticated');
    location.reload();
  }
}
