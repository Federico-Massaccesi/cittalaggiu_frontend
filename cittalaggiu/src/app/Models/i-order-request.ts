import { iCartItem } from "./cart-item";

export interface IOrderRequest {
  clientId: number;
  products: iCartItem[];
  totalPrice: number;
  pending: boolean;
}
