import { Component } from '@angular/core';
import { CRUDService } from '../../CRUD.service';
import { IProduct } from '../../Models/i-product';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  images: string[] = [];
  productUrl: string = environment.productsUrl;
  captions: string[] = [
    'Benvenuto in Food Manager',
    'Il tuo supermercato online',
    'Per aziende e privati',
    'Trova tutto ciò che ti serve',
    'Per la tua cena da Re!'
  ];
  maxItems: number = 5;  // Numero massimo di elementi da mostrare nel carosello

  constructor(private crudService: CRUDService) {}

  ngOnInit(): void {
    this.crudService.getAllEntities(this.productUrl, 'product').subscribe((products: IProduct[]) => {
      this.images = products.map(product => product.imageURL);
    });
  }

  trackByImage(index: number, image: string): string {
    return image;
  }
}
