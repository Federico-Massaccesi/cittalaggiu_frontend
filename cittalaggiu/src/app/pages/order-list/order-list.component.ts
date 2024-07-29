import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IOrder } from '../../Models/i-order';
import { CRUDService } from '../../CRUD.service';
import { BehaviorSubject, Observable, Subscription, map, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { iRole } from '../../Models/iUser';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {
  orders$: Observable<IOrder[]> = this.crudService.orderItems$;
  filteredOrders$: BehaviorSubject<IOrder[]> = new BehaviorSubject<IOrder[]>([]);
  userRoles: iRole[] | undefined;
  isAdmin: boolean = false;
  currentFilter: string = 'new';
  private subscriptions: Subscription[] = [];
  showNewOrdersButton: boolean = false;

  constructor(private crudService: CRUDService,
    private router :Router,
    private authSvc: AuthService
  ) { }

  ngOnInit(): void {
    this.userRoles = this.authSvc.getUserRole();
    this.isAdmin = this.userRoles?.some(role => role.roleType === 'ADMIN') || false;

    const ordersSub = this.crudService.getAllEntities(environment.ordersUrl, 'order').pipe(
      switchMap(() => this.orders$)
    ).subscribe(orders => {
      if (orders.some(order => !order.checked)) {
        this.filteredOrders$.next(orders.filter(order => !order.checked));
      } else {
        this.filteredOrders$.next(orders);
        this.currentFilter = 'all';
      }
      this.showNewOrdersButton = orders.some(order => !order.checked);
    });

    this.subscriptions.push(ordersSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  markAsChecked(orderId: number): void {
    this.crudService.patchOrderChecked(environment.ordersUrl, orderId, true).subscribe();
  }

  deleteOrder(orderId: number): void {
    this.crudService.deleteEntity(environment.ordersUrl, orderId, 'order').subscribe(() => {
      this.setFilter(this.currentFilter);
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;

    // Modifica: Miglioramento della logica di filtraggio
    const filterSub = this.orders$.pipe(
      map(orders => {
        switch (filter) {
          case 'completed':
            return orders.filter(order => order.completed);
          case 'incomplete':
            return orders.filter(order => !order.completed);
          // Modifica: Aggiunta del filtro `checked`
          case 'new':
            return orders.filter(order => !order.checked);
          default:
            return orders;
        }
      })
    ).subscribe(filtered => this.filteredOrders$.next(filtered));

    this.subscriptions.push(filterSub);
  }

  viewOrderDetails(orderId: number, checked: boolean): void {
    const isWarehouse = this.userRoles?.some(role => role.roleType === 'WAREHOUSE');
    if (isWarehouse && !checked) {
      this.crudService.patchOrderChecked(environment.ordersUrl, orderId, true).subscribe(() => {
        this.router.navigate(['/order-details', orderId]);
      });
    } else {
      this.router.navigate(['/order-details', orderId]);
    }
  }
}
