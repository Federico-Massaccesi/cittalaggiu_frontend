import { Component } from '@angular/core';
import { IOrder } from '../../Models/i-order';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDService } from '../../CRUD.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent {
  order: IOrder | undefined;
  isCollapsed = true;
  isWarehouse: boolean = false;
  isAdmin: boolean = false;
  checkedItems: boolean[] = [];
  showError: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private crudService: CRUDService,
    private authService: AuthService,
    private router: Router

  ) {}

  ngOnInit(): void {
    const roles = this.authService.getUserRole();
    this.isWarehouse = roles?.some(role => role.roleType === 'WAREHOUSE') || false;
    this.isAdmin = roles?.some(role => role.roleType === 'ADMIN') || false;
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      const idNumber = Number(orderId);
      this.crudService.getOneEntity(environment.ordersUrl, idNumber, 'order').subscribe((order: IOrder) => {
        this.order = order;
        this.checkedItems = this.order.items.map(() => false);
      });
    }
  }

  toggleCheckbox(index: number): void {
    this.checkedItems[index] = !this.checkedItems[index];
  }

  allItemsChecked(): boolean {
    return this.checkedItems.every(item => item);
  }

  printOrder(): void {
    if (this.order) {
      if (this.isWarehouse && !this.order.completed) {
        if (this.allItemsChecked()) {
          this.order.completed = true;
          this.crudService.patchOrderCompleted(environment.ordersUrl, this.order.id!, true).subscribe(() => {
            // AGGIUNGERE EMAIL DI AVVISO ORDINE
            window.print();
            this.router.navigate(['/order-list']);
          });
          this.showError = false;
        } else {
          this.showError = true;
        }
      } else {
        window.print();
        this.showError = false;
      }
    }
  }
}
