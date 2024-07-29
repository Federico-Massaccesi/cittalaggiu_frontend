import { iCartItem } from './cart-item';
import { iUser } from "./iUser";

export interface IOrder {

  id?: number;
  client: iUser;
  items: iCartItem[];
  localDate: Date;
  pending: boolean;
  totalPrice: number;
  checked: boolean;
  completed:boolean;
}


