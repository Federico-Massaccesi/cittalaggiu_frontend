import { ICategory } from "./i-category";

export interface IProduct {
  id?:number;
name: string,
categories: ICategory[];
price:number;
description:string;
imageURL:string;
available:boolean;
}

