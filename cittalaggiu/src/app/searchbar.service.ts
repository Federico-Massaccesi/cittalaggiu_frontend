import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { IProduct } from './Models/i-product';
import { iUser } from './Models/iUser';

@Injectable({
  providedIn: 'root'
})
export class SearchbarService {

  private productUrl = environment.productsUrl;
  private userUrl = environment.usersUrl;
  public searchQuery = new BehaviorSubject<string>('');
  $currentSearchQuery = this.searchQuery.asObservable();

  constructor(private http: HttpClient) {}

  changeSearchQuery(query: string) {
    this.searchQuery.next(query);
  }

  searchProducts(query = ''): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(`${this.productUrl}/search?q=${query}`);
  }

  searchUsers(query = ''): Observable<iUser[]> {
    return this.http.get<iUser[]>(`${this.userUrl}/search?q=${query}`);
  }

  resetSearchQuery() {
    this.searchQuery.next('');
  }
}
