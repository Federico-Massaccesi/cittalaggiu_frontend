import { CRUDService } from './../../CRUD.service';
import { Component } from '@angular/core';
import { CartService } from './cart.service';
import { iCartItem } from '../../Models/cart-item';
import { Subscription, pipe, tap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { IOrderRequest } from '../../Models/i-order-request';
import { iRole } from '../../Models/iUser';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  cartList: iCartItem[] = [];
  totalPrice: number = 0;
  private cartSubscription!: Subscription;
  private productSubscription!: Subscription;
  private userRoles: iRole[] | undefined;
  isCompanyUser: boolean = false;
  payLater: boolean = false;
  missingProductIds: (number|undefined)[] = [];
  unavailableProductIds: (number|undefined)[] = [];
  orderBlocked: boolean = false;

  constructor(private cartSvc: CartService, private authSvc: AuthService, private router: Router, private crudSvc: CRUDService) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartSvc.cart$.subscribe(cart => {
      this.cartList = cart;
      this.updateTotalPrice();

      this.userRoles = this.authSvc.getUserRole();
      this.isCompanyUser = this.userRoles?.some(role => role.roleType === 'COMPANY') || false;
      this.checkMissingProducts();
      this.checkProductAvailability();
      this.updateOrderBlockedStatus();
    });

    this.productSubscription = this.crudSvc.productItems$.subscribe(() => {
      this.checkMissingProducts();
      this.checkProductAvailability();
      this.updateOrderBlockedStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  }

  checkMissingProducts(): void {
    this.crudSvc.productItems$.subscribe(productItems => {
      const productIds = productItems.map(product => product.id).filter((id): id is number => id !== undefined);
      if (productIds.length == 0) {
        this.crudSvc.getAllEntities(environment.productsUrl, 'product').subscribe();
      }
      this.missingProductIds = this.cartList
        .map(item => item.product.id)
        .filter(id => id !== undefined && !productIds.includes(id));
    });
  }

  checkProductAvailability(): void {
    this.crudSvc.productItems$.subscribe(productItems => {
      this.unavailableProductIds = productItems
        .filter(product => !product.available)
        .map(product => product.id)
        .filter((id): id is number => id !== undefined);
    });
  }

  updateTotalPrice(): void {
    this.totalPrice = this.cartSvc.getTotalPrice();
  }

  updateOrderBlockedStatus(): void {
    this.orderBlocked = this.cartList.some(item =>
      this.missingProductIds.includes(item.product.id) || this.unavailableProductIds.includes(item.product.id)
    );
  }

  incrementQuantity(item: iCartItem): void {
    item.quantity++;
    this.cartSvc.addProductToCart(item.product, item.quantity);
    this.updateTotalPrice();
  }

  decrementQuantity(item: iCartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartSvc.addProductToCart(item.product, item.quantity);
    } else {
      this.removeFromCart(item);
    }
    this.updateTotalPrice();
  }

  removeFromCart(item: iCartItem): void {
    this.cartSvc.removeProductFromCart(item.product);
    this.updateTotalPrice();
  }

  createOrder(): void {
    if (this.orderBlocked) {
      return;
    }

    const clientId = this.authSvc.getUserId();
    if (clientId === null) {
      return;
    }

    if (this.cartList.length === 0) {
      console.error('Cart is empty. Cannot create order.');
      return;
    }

    if (this.userRoles?.some(role => role.roleType === 'PRIVATE')) {
      this.router.navigate(['/cart/payment'], { state: { clientId, cartList: this.cartList, totalPrice: this.totalPrice, pending: false } });
    } else if (this.isCompanyUser) {
      if (this.payLater) {
        const order: IOrderRequest = {
          clientId: clientId,
          products: this.cartList,
          totalPrice: this.totalPrice,
          pending: true
        };

        this.cartSvc.createOrder(order).subscribe({
          next: (response) => {
            this.cartSvc.cleanCart();
            this.router.navigate(['/productList']);
          }
        });
      } else {
        this.router.navigate(['/cart/payment'], { state: { clientId, cartList: this.cartList, totalPrice: this.totalPrice, pending: false } });
      }
    }
  }
}
