import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDetailsRoutingModule } from './user-details-routing.module';
import { UserDetailsComponent } from './user-details.component';
import { ShareModuleModule } from '../../share-module/share-module.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    UserDetailsComponent
  ],
  imports: [
    CommonModule,
    UserDetailsRoutingModule,
    ShareModuleModule,
    RouterModule
  ]
})
export class UserDetailsModule { }
