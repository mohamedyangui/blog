import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3001/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      this.validateToken();
    }
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string; refreshToken: string }>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response: { token: string; refreshToken: string }) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.validateToken();
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.baseUrl}/refresh-token`, { refreshToken }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.validateToken();
      })
    );
  }

  validateToken() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      this.userSubject.next({ _id: decoded.id, username: '', email: '', role: decoded.role });
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }
}