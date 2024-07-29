import { Injectable } from '@angular/core';
import { IProduct } from '../../Models/i-product';
import { iCartItem } from '../../Models/cart-item';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IOrderRequest } from '../../Models/i-order-request';
import { IOrder } from '../../Models/i-order';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: iCartItem[] = [];
  private cartSubject = new BehaviorSubject<iCartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor(private http:HttpClient) {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart);
    }
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart);
  }

  addProductToCart(product: IProduct, quantity: number) {
    const existingItem = this.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      const newItem: iCartItem = { product, quantity };
      this.cart.push(newItem);
    }
    this.saveCart();
  }

  removeProductFromCart(product: IProduct) {
    this.cart = this.cart.filter(item => item.product.id !== product.id);
    this.saveCart();
  }

  getCart(): iCartItem[] {
    return this.cart;
  }

  getCartCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  cleanCart(): void {
    this.cart = [];
    this.saveCart();
  }

  isProductInCart(productId: number): boolean {
    return this.cart.some(item => item.product.id === productId);
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => {
      if (item.product && item.product.price) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  }

  createOrder(order: IOrderRequest):Observable<IOrder> {
    return this.http.post<IOrder>(environment.ordersUrl, order,{responseType: 'json'});
  }
}
