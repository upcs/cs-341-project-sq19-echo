import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {sha512} from 'js-sha512';
import {CookieService} from 'ngx-cookie-service';
import {LoginControls, SignUpControls, ResetControls} from './login.component.interfaces';
import {matchingPasswords} from './login.component.functions';
import {HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private MIN_PASSWORD_LENGTH = 8;
  private userAccounts: {[email: string]: string} = {};
  public questions: string[] = ['What was the last name of your third grade teacher?', 
    'What street did you live on in third grade?', 
    'What was your childhood nickname', 
    'What is the name of your faborite childhood friend?', 
    'In what city does your nearest sibling live?'];

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

  public constructor(private titleService: Title, private formBuilder: FormBuilder, private cookie: CookieService, private http: HttpClient) {
    titleService.setTitle('Login Page');

    this.signupForm = this.formBuilder.group(
      this.signupControls, {validator: matchingPasswords('password', 'confirmPassword')}
    );
    this.loginForm = this.formBuilder.group(this.loginControls);
    this.resetForm = this.formBuilder.group(this.resetControls);
  }

  public signUp(): void {
    const email = this.signupControls.email.value;
    const password = sha512(this.signupControls.password.value);
    const question = this.signupControls.questionRequire.value;
    const answer = sha512(this.signupControls.answerRequire.value.toLowerCase())
    let command = "select * from users where user='" + email + "'"
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      if(data.length > 0) {
        alert('An account has already been created with this email.');
        return;
      }
      command = "insert into users (user, password, question, answer) VALUES ('" + email + "', '" + password + "', '" + question +"', '" + answer +"')"
      this.http.post('/api', {command:command}).subscribe((data: any[]) => {
        alert(`Account created with email: ${email}.`);
        this.signupForm.reset()
        return
      }, (error: any) => {
        alert("Cannot get information. Check that you are connected to the internet.")
      })

    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
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

    let command = "select * from users where user='" + email +"'"
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      if(data.length > 0) {
        if(data[0].password == hashedPassword) {
          this.cookie.set('authenticated', email);
          this.loginForm.reset();
          alert(`User with email ${email} successfully logged in.`);
        }
        else {
          alert('Email or password is incorrect');
        }
      }
      else {
        alert('email or password is incorrect');
      }
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
  }

  public continueReset(): void {
    const email = this.resetControls.emailReset.value;
    let command = "select * from users where user='" + email +"'"
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      if(data.length == 0) {
        alert("No user with that email was found")
        return;
      }
      else {
        document.getElementById("emailHide").style.display = 'none'
        document.getElementById("continue").style.display = 'none'
        document.getElementById("answerHide").style.display = 'block'
        document.getElementById("passwordHide").style.display = 'block'
        document.getElementById("resetButton").style.display = 'block'
        document.getElementById("resetQuestion").style.display = 'block'
        document.getElementById("resetQuestion").textContent = data[0].question
      }
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
  }

  public resetPass(): void {
    const email = this.resetControls.emailReset.value;
    const hashedPassword = sha512(this.resetControls.passwordReset.value);
    const hashedAnswer = sha512(this.resetControls.answerReset.value.toLowerCase());

    let command = "select * from users where user='" + email +"'"
    this.http.post('/api', {command:command}).subscribe((data: any[]) => {
      if(hashedAnswer !== data[0].answer) {
        alert('Incorrect Answer')
        return;
      }
      command = "replace into users VALUES ('" + email + "', '" + hashedPassword + "', '" + data[0].question +"', '" + data[0].answer +"')"
      this.http.post('/api', {command:command}).subscribe((data: any[]) => {
        alert('Password was reset')
        document.getElementById("emailHide").style.display = 'block'
        document.getElementById("continue").style.display = 'block'
        document.getElementById("answerHide").style.display = 'none'
        document.getElementById("passwordHide").style.display = 'none'
        document.getElementById("resetButton").style.display = 'none'
        document.getElementById("resetQuestion").style.display = 'none'
        document.getElementById("resetQuestion").textContent = ""
        this.resetForm.reset();
        return
      }, (error: any) => {
        alert("Cannot get information. Check that you are connected to the internet.")
      });
    }, (error: any) => {
      alert("Cannot get information. Check that you are connected to the internet.")
    })
    
  }
}
