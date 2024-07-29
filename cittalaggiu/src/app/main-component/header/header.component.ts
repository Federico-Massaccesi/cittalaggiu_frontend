import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { iRole } from '../../Models/iUser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isUser: boolean = false;
  isAdmin: boolean = false;
  isWarehouse: boolean = false;
  isAuthenticated$: Observable<boolean>;
  userId: number | null = null;
  isCollapsed = true;

  constructor(private authSvc: AuthService) {
    this.isAuthenticated$ = this.authSvc.isAuthenticated();
  }

  ngOnInit(): void {
    this.userId = this.authSvc.getUserId();

    this.authSvc.getUserRoles$().subscribe(roles => {
      this.isUser = roles.some(role => role.roleType === 'PRIVATE' || role.roleType === 'COMPANY');
      this.isAdmin = roles.some(role => role.roleType === 'ADMIN');
      this.isWarehouse = roles.some(role => role.roleType === 'WAREHOUSE');
    });
  }

  logout() {
    this.authSvc.logout();
  }

  closeCollapse() {
    this.isCollapsed = true;
  }

  getLoggedUserId(): number | null {
    return this.authSvc.getUserId();
  }
}
