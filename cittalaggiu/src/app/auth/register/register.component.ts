import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { iUser } from '../../Models/iUser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerData: Partial<iUser> = {
    roles : [],
    newsletter: false
  }
  registerDataAdmin: Partial<iUser> = {
    roles : []
  }

  privateOrCompany:boolean = false;

  admin:boolean = false;

  warehouse:boolean = false;

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) { }

  signUpClient() {

    if(this.privateOrCompany == false){
      this.registerData.roles?.push({roleType:"PRIVATE"})
    }else{
      this.registerData.roles?.push({roleType:"COMPANY"})
    }

    this.authSvc.register(this.registerData)
      .subscribe(data => {

        this.router.navigate(['/auth/login'])

      })
  }
  signUpAdmin() {
    if (this.admin == true && this.warehouse == true) {
      this.registerDataAdmin.roles?.push({ roleType: "WAREHOUSE" });
    } else if (this.admin == true && this.warehouse == false) {
      this.registerDataAdmin.roles?.push({ roleType: "ADMIN" });
    }

    this.authSvc.register(this.registerDataAdmin)
      .subscribe({
        next: data => this.router.navigate(['/auth/login']),
        error: error => console.error('Error during admin registration:', error)
      });
  }
}
