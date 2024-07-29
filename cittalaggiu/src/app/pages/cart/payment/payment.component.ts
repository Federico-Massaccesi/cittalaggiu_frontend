import { Component } from '@angular/core';
import { IOrderRequest } from '../../../Models/i-order-request';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { AuthService } from '../../../auth/auth.service';
import { CRUDService } from '../../../CRUD.service';
import { IOrder } from '../../../Models/i-order';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  clientId: number | null = null;
  cartList: any[] = [];
  totalPrice: number = 0;
  pending: boolean = false;
  orderId: number | null = null;
  isOrderPending: boolean = false;
  isFromCart: boolean = true;
  constructor(
    private cartSvc: CartService,
    private authSvc: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private crudSvc: CRUDService
  ) { }

  ngOnInit(): void {
    this.clientId = this.authSvc.getUserId();
    console.log(this.clientId);

    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] ? +params['orderId'] : null;
      if (this.orderId) {
        this.isFromCart = false;
        this.loadOrderDetails(this.orderId);
      } else {
        this.cartList = this.cartSvc.getCart();
        this.totalPrice = this.cartSvc.getTotalPrice();
      }
    });
  }

  loadOrderDetails(orderId: number): void {
    this.crudSvc.getOneEntity(environment.ordersUrl, orderId, 'order').subscribe((order: IOrder) => {
      this.cartList = order.items;
      this.totalPrice = order.totalPrice;
      this.isOrderPending = order.pending;
    });
  }

  processPayment(): void {
    if (this.clientId === null) {
      return;
    }

    if (this.isFromCart) {
      const order: IOrderRequest = {
        clientId: this.clientId,
        products: this.cartList,
        totalPrice: this.totalPrice,
        pending: this.pending
      };

      this.cartSvc.createOrder(order).subscribe({
        next: (response) => {
          this.cartSvc.cleanCart();
          this.router.navigate(['/productList']);

        }
      });
    } else if (this.orderId) {
      this.crudSvc.patchOrderPending(environment.ordersUrl, this.orderId, false).subscribe({
        next: (response) => {
          this.router.navigate([`/profile/${this.clientId}`])
        }
      });
    }
  }
}
