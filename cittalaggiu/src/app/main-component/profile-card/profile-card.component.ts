import { Router } from '@angular/router';
import { Component, Input, SimpleChanges } from '@angular/core';
import { iUser } from '../../Models/iUser';
import { CRUDService } from '../../CRUD.service';
import { IOrder } from '../../Models/i-order';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss'
})
export class ProfileCardComponent {

  @Input() user!: iUser;
  orders: IOrder[] = [];
  isOrdersCollapsed = true;
  @Input() isAdmin!: boolean;
  @Input() isPrivateUser!: boolean;
  @Input() isCompanyUser!: boolean;
  editMode = false;
  loggedUserId: number | null = null;


  constructor(private crudSvc: CRUDService,
    private authSvc: AuthService,
    private router: Router){}

  ngOnInit() {
    this.loggedUserId = this.authSvc.getUserId();

    if (this.user) {
      this.loadOrders();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadOrders();

    }
  }

  loadOrders() {
    if (this.user && this.user.id) {
      this.crudSvc.getUserOrders(this.user.id).subscribe((orders: IOrder[]) => {
        console.log(orders);
        this.orders = orders.map(order => {
          return {
            ...order,
            localDate: new Date(order.localDate)
          };
        });
      });
    }
  }


  updateUser() {
    if (this.user && this.user.id) {
      this.crudSvc.updateUser(this.user.id, this.user).subscribe(updatedUser => {
        this.user = updatedUser;
        this.editMode = false;
      });
    }
  }

  getDateDifferenceInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getOrderStatusClass(orderDate: Date): string {
    const currentDate = new Date();
    const diffDays = this.getDateDifferenceInDays(orderDate, currentDate);

    if (diffDays > 14) {
      return 'text-danger'; // rosso
    } else if (diffDays > 1) {
      return 'text-warning'; // giallo
    } else {
      return 'd-none'; // nessuna classe aggiuntiva
    }
  }

  navigateToPayment(orderId: number): void {
    this.router.navigate(['/cart/payment'], { queryParams: { orderId: orderId } });
  }

  checkUserRole(roleType: string): boolean {
    return this.user?.roles?.some(role => role.roleType === roleType) || false;
  }
}
