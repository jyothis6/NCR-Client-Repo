import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { ApiService } from './../services/api.service'; // adjust the path as needed

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private api: ApiService, private router: Router) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  login(ssoid: string, password: string) {
    return this.api.fetchUsers().pipe(
      map(users => {
        const user = users.find(u => u.email === ssoid && u.password === password);

        if (user) {
          const token = 'fake-token';
          const userData = {
            email: user.email,
            username: user.name,
            role: user.role
          };
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          this.userSubject.next(userData);
          return true;
        }

        throw new Error('Invalid credentials');
      }),
      catchError(() => of(false))
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  get currentUser() {
    return this.userSubject.value;
  }
}
