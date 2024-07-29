import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart.component';
import { PaymentComponent } from './payment/payment.component';

const routes: Routes = [
  {
    path: '',
     component: CartComponent
    },
  {
    path:'payment'
    , component: PaymentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
