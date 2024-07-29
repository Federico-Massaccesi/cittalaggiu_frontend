import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, inject } from '@angular/core';
import { CRUDService } from '../../CRUD.service';
import { IProduct } from '../../Models/i-product';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { ICategory } from '../../Models/i-category';
import { AuthService } from '../../auth/auth.service';
import { IProductRequest } from '../../Models/iproduct-request';
import { SearchbarService } from '../../searchbar.service';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {

  newProduct:Partial<IProductRequest> = {

    available:false,
    categories:[]
  }

  isSearchBarActive: boolean = false;


  isUser:boolean = true;

  isAdmin:boolean = false;

  categoriesUrl :string = environment.categoriesUrl;

  selectedCategoryIds: number[] = [];
  allCategories: ICategory[] = [];

  productUrl:string = environment.productsUrl

  availableCreate:boolean = false

  private selectedFile: File | undefined;

  products: IProduct[] = [];
  results: IProduct[] = [];

  searchQuery: string = '';

  descriptionError: boolean = false;


  constructor(
     public crudSvc: CRUDService,
     private http:HttpClient,
     private authSvc: AuthService,
     private searchSvc: SearchbarService
    ) {}

    ngOnInit(): void {
      if (this.authSvc.getUserRole()?.some(role => role.roleType === 'PRIVATE' || role.roleType === 'COMPANY')) {
        this.isUser = true;
      } else {
        this.isUser = false;
      }
      if (this.authSvc.getUserRole()?.some(role => role.roleType === 'ADMIN')) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      this.crudSvc.getAllEntities(this.productUrl, 'product').subscribe(products => {
        this.products = products;
        this.results = products;
      });

      this.crudSvc.productItems$.subscribe(products => {
        this.products = products;
        if (!this.searchQuery) {
          this.results = products;
        }
      });

      this.searchSvc.$currentSearchQuery.subscribe(query => {
        this.searchQuery = query;
        if (query) {
          this.searchSvc.searchProducts(query).subscribe(data => {
            this.results = data.length > 0 ? [...data] : [];
          });
        } else {
          this.results = this.products;
        }
      });
    }

    ngOnDestroy(): void {
      this.searchSvc.resetSearchQuery();
    }

  private modalService = inject(NgbModal);

	open(content: TemplateRef<any>) {
    this.fetchCategories();

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => {
        this.createProduct();
      }
    );
  }

  onDescriptionInput(event: any) {
    const description = event.target.value;
    this.descriptionError = description.length > 255;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
  }
onSubmit(form: NgForm) {
  if (form.invalid) {
    return;
  }
    }

    createProduct() {
      if (this.newProduct.description && this.newProduct.description.length > 255) {
        this.descriptionError = true;
        return;
      }

      this.newProduct.categories = this.selectedCategoryIds;
      this.newProduct.available = this.availableCreate;

      if (this.selectedFile !== undefined && this.newProduct.name !== undefined) {
        this.crudSvc.createProductWithImage(this.productUrl, this.newProduct, this.selectedFile).subscribe();
      }
    }

  fetchCategories() {
    this.http.get<ICategory[]>(this.categoriesUrl).subscribe(
      (categories) => {
        this.allCategories = categories;
      }
    );
  }

  get searchQuery$() {
    return this.searchSvc.$currentSearchQuery;
  }

  updateSearchQuery(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target?.value ?? '';
    this.searchSvc.changeSearchQuery(query);
  }
  toggleSearchBar() {
    this.isSearchBarActive = !this.isSearchBarActive;
  }
}
