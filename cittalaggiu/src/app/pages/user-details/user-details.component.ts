import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { CRUDService } from '../../CRUD.service';
import { iRole, iUser } from '../../Models/iUser';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent {
  userUrl:string = environment.usersUrl;

  user!:iUser
  isAdmin!: boolean;
  isPrivateUser!: boolean;
  isCompanyUser!: boolean;
  constructor(
    private route: ActivatedRoute,
    private userSvc: CRUDService,
    private authSvc: AuthService
  ){

  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      const idNumber = Number(userId);
      this.userSvc.getOneEntity(this.userUrl, idNumber, 'user').subscribe((user: iUser) => {
        this.user = user;
        this.checkRoles()
      });
    }
  }

  checkRoles() {
    const roles: iRole[] | undefined = this.authSvc.getUserRole();
    if (roles) {
      this.isPrivateUser = roles.some(role => role.roleType === 'PRIVATE');
      this.isCompanyUser = roles.some(role => role.roleType === 'COMPANY');
      this.isAdmin = roles.some(role => role.roleType === 'ADMIN');
    }
  }
}
