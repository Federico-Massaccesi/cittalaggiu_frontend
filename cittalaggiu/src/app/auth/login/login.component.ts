import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LoginDTO } from '../../Models/login-dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginData:LoginDTO = {
    username:'',
    password:''
  }
  submitted: boolean = false;
  constructor(
    private authSvc:AuthService,
    private router:Router
    ){}

    signIn(){
      this.submitted = true;
      if (!this.loginData.username || !this.loginData.password) {
        return;
      }
      this.authSvc.login(this.loginData)
      .subscribe(data => {
        this.router.navigate(['/productList'])
      })

    }

}
