import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCardComponent } from '../main-component/profile-card/profile-card.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [ProfileCardComponent],
  imports: [CommonModule,RouterModule,NgbModule,FormsModule,ReactiveFormsModule],
  exports: [ProfileCardComponent,FormsModule,ReactiveFormsModule]
})
export class ShareModuleModule { }
