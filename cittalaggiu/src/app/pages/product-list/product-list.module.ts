import { ProductCardComponent } from './../../main-component/product-card/product-card.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductListRoutingModule } from './product-list-routing.module';
import { ProductListComponent } from './product-list.component';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    ProductListComponent,ProductCardComponent
  ],
  imports: [
    CommonModule,
    ProductListRoutingModule,
    FormsModule,
    NgbTooltipModule,
  ]
})
export class ProductListModule { }
