import { Component, OnInit, TemplateRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProduct } from '../../Models/i-product';
import { CRUDService } from '../../CRUD.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ICategory } from '../../Models/i-category';
import { CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {

  editedProduct: Partial<IProduct> = {};

  prodUrl:string = environment.productsUrl

  categoryUrl:string = environment.categoriesUrl

  product: IProduct | undefined;

  isUser!:boolean;

  isAdmin!:boolean;

  isWarehouse!: boolean;

  productAvailable!:boolean

  allCategories!:ICategory[]

  selectedCategoryIds: number[] = [];

  pageProductID!:number

  showConfirmButton: boolean = false;

  private selectedFile: File | undefined;

  productInCart!: boolean;

  quantity: number = 0;

  showTooltip: { [key: number]: boolean } = {};

  quantityWarnings: boolean = false;

  storedQuantity: number = 0;

  private cartSubscription!: Subscription;

  descriptionError: boolean = false;

  constructor(
  private route: ActivatedRoute,
  private router: Router,
    private prodSvc: CRUDService,
    private authSvc : AuthService,
    private http:HttpClient,
    private cartSvc: CartService,
){}

ngOnInit(): void {
  this.isUser = this.authSvc.getUserRole()?.some(role => role.roleType === 'PRIVATE' || role.roleType === 'COMPANY') || false;
  this.isAdmin = this.authSvc.getUserRole()?.some(role => role.roleType === 'ADMIN') || false;
  this.isWarehouse = this.authSvc.getUserRole()?.some(role => role.roleType === 'WAREHOUSE') || false;

  const productId = this.route.snapshot.paramMap.get('id');
  if (productId) {
    const idNumber = Number(productId);
    this.pageProductID = idNumber;
    this.prodSvc.getOneEntity(this.prodUrl, idNumber, 'product').subscribe((product: IProduct) => {
      this.product = product;
      this.productAvailable = this.product?.available || false;
      this.editedProduct = { ...this.product };

      if (product !== undefined && product.categories !== undefined) {
        this.selectedCategoryIds = this.product.categories.map(category => category.id).filter((id): id is number => id !== undefined);
      }

      this.cartSubscription = this.cartSvc.cart$.subscribe(cart => {
        const cartItem = cart.find(item => item.product.id === this.product?.id);
        if (cartItem) {
          this.productInCart = true;
          this.quantity = cartItem.quantity;
          this.storedQuantity = cartItem.quantity;
        } else {
          this.productInCart = false;
          this.quantity = 0;
          this.storedQuantity = 0;
        }
      });
    });
  }
  this.fetchCategories();
}

ngOnDestroy(): void {
  if (this.cartSubscription) {
    this.cartSubscription.unsubscribe();
  }
}

onDescriptionInput(event: any) {
  const description = event.target.value;
  this.descriptionError = description.length > 255;
}

deleteProduct(modal: NgbActiveModal): void {
  if (this.pageProductID !== undefined) {
    this.prodSvc.deleteEntity(this.prodUrl, this.pageProductID, 'product').subscribe(() => {
      this.router.navigate(['/productList']);
      modal.close();
    });
  }
}



toggleProductAvailable(): void {
  this.showConfirmButton = true;
}

toggleAvailability(checked: boolean): void {
  if (this.product) {
    const url = `${this.prodUrl}/${this.product.id}/availability`;
    this.http.patch<IProduct>(url, { available: checked }).subscribe({
      next: (updatedProduct) => {
        if (updatedProduct) {
          this.productAvailable = updatedProduct.available;
        }
        this.router.navigate(['/productList']);

      },
      error: (error) => {
        console.error('Error updating product availability:', error);
      }
    });
  }
}

private modalService = inject(NgbModal);

open(content: TemplateRef<any>) {
  this.fetchCategories();

  const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  modalRef.result.then(
    (result) => {
    },
    (reason) => {
    }
  );
}


updateProduct(modal: NgbActiveModal): void {
  if (this.product) {
    const selectedCategories = this.selectedCategoryIds.map(id => {
      return this.allCategories.find(category => category.id === id)!;
    });

    const updatedProduct: IProduct = {
      ...this.product,
      name: this.editedProduct.name!,
      price: this.editedProduct.price!,
      description: this.editedProduct.description!,
      imageURL: this.editedProduct.imageURL!,
      available: this.editedProduct.available!,
      categories: selectedCategories
    };

    this.prodSvc.updateProduct(this.prodUrl, this.pageProductID, updatedProduct, this.selectedFile).subscribe({
      next: (response) => {
        this.product = updatedProduct;
        modal.close(); // Chiude la modale
      },
      error: (error) => {
        console.error('Error updating product', error);
      }
    });
  }
}

onSubmit(form: NgForm) {
  if (form.invalid) {
    return;
  }
}

fetchCategories() {
  this.http.get<ICategory[]>(this.categoryUrl).subscribe(
    (categories) => {
      this.allCategories = categories;
    }
  );
}

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  this.selectedFile = file;
}

addToCart(product: IProduct): void {
  if (this.quantity < 1) {
    this.quantityWarnings = true;
    return;
  } else {
    this.cartSvc.addProductToCart(product, this.quantity);
    this.quantityWarnings = false;
    console.log('Product added to cart:', product);
  }
}

removeFromCart(): void {
  if (this.product) {
    this.cartSvc.removeProductFromCart(this.product);
    this.productInCart = false;
    this.quantity = 0;
    this.storedQuantity = 0;
    console.log('Product removed from cart:', this.product);
  }
}

openCartCommands(): void {
  if (this.product) {
    this.showTooltip[this.product.id!] = true;
    if (!this.productInCart) {
      this.quantity = 1;
    } else {
      const cartItem = this.cartSvc.getCart().find(item => item.product.id === this.product!.id);
      if (cartItem) {
        this.quantity = cartItem.quantity;
      }
    }
  }
}

checkQuantity(): void {
  if (this.quantity === 0) {
    this.removeFromCart();
    this.quantityWarnings = true;
  } else if (this.quantity === null || this.quantity === undefined ) {
    this.quantity = 1;
    this.quantityWarnings = false;
  } else {
    this.quantityWarnings = false;
  }
}

onImageError() {
  console.error('L\'immagine non può essere caricata.');
}

openVerticallyCentered(content: TemplateRef<any>) {
  this.modalService.open(content, { centered: true });
}
    }
