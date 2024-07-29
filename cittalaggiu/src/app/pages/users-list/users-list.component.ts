import { Component } from '@angular/core';
import { iUser } from '../../Models/iUser';
import { CRUDService } from '../../CRUD.service';
import { environment } from '../../../environments/environment';
import { SearchbarService } from '../../searchbar.service';
import { AuthService } from '../../auth/auth.service';
import { IOrder } from '../../Models/i-order';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  userList!: iUser[];
  results!: iUser[];
  searchQuery: string = '';
  userUrl: string = environment.usersUrl;
  orders: IOrder[] = [];

  constructor(
    private userSvc: CRUDService,
    private searchSvc: SearchbarService,
    private authSvc: AuthService
  ) { }

  ngOnInit(): void {
    this.userSvc.getAllEntities(this.userUrl, 'user').subscribe((users: iUser[]) => {
      this.userList = users;
      this.results = users;
      this.fetchAllOrders();
    });

    this.userSvc.userItems$.subscribe((users: iUser[]) => {
      this.userList = users;
      if (!this.searchQuery) {
        this.results = users;
      }
    });

    this.searchSvc.$currentSearchQuery.subscribe(query => {
      this.searchQuery = query;
      if (query) {
        this.searchSvc.searchUsers(query).subscribe(data => {
          this.results = data.length > 0 ? [...data] : [];
        });
      } else {
        this.results = this.userList;
      }
    });
  }

  updateSearchQuery(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target?.value ?? '';
    this.searchSvc.changeSearchQuery(query);
  }

  hasRole(user: iUser, role: string): boolean {
    return user.roles.some(r => r.roleType === role);
  }

  hasPendingOrders(user: iUser): boolean {
    return this.orders.filter(order => order.client.id === user.id && order.pending).length > 3;
  }

  private fetchAllOrders() {
    this.userSvc.getAllEntities(environment.ordersUrl, 'order').subscribe((orders: IOrder[]) => {
      this.orders = orders;
    });
  }
}
