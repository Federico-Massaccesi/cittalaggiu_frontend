import { CartService } from './../../pages/cart/cart.service';
import { Component, Input } from '@angular/core';
import { IProduct } from '../../Models/i-product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {

  constructor(private cartSvc: CartService){  }

  @Input() product!: IProduct;
  @Input() isUser: boolean | undefined;

  productInCart!: boolean;
  quantity: number = 0;
  showTooltip: { [key: number]: boolean } = {};
  quantityWarnings: boolean = false;

  private cartSubscription!: Subscription;

  ngOnInit(): void {

    if (!this.product || this.product.id === undefined) {
      return;
    }

    this.cartSubscription = this.cartSvc.cart$.subscribe(cart => {
      const cartItem = cart.find(item => item.product.id === this.product.id);
      if (cartItem) {
        this.productInCart = true;
        this.quantity = cartItem.quantity;
      } else {
        this.productInCart = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  toggleTooltip(): void {
    if (this.product.id !== undefined) {
      this.showTooltip[this.product.id] = !this.showTooltip[this.product.id];
    } else {
      console.error('Product ID is undefined');
    }
  }

  addToCart(): void {
    if (this.quantity > 0) {
      this.cartSvc.addProductToCart(this.product, this.quantity);
      this.toggleTooltip()
    } else {
      this.quantityWarnings = true;
      console.error('Invalid quantity:', this.quantity);
    }
  }

  removeFromCart(): void {
    this.cartSvc.removeProductFromCart(this.product);
    this.productInCart = false;
    this.quantity = 0;
  }
}
