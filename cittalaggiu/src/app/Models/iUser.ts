import { IOrder } from "./i-order";

export interface iUser {
id?: number;

 username: string,

 password: string;

 companyName?: string;

  email: string;

  piva?: string;

  address: string;

  town: string;

  cap:number;

  orders: IOrder[];

  roles: iRole[];

  newsletter:boolean;

  telephoneNumber:number;
}

export interface iRole{
  id?:number;
  roleType:string;
}
