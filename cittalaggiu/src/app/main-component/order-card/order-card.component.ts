import { Component, Input } from '@angular/core';
import { IOrder } from '../../Models/i-order';

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  @Input() order!:IOrder
}
