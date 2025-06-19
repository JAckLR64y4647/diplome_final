import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, AuthState, LoginCredentials, RegisterData, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });

  private readonly BASE_URL = 'https://r9j9iupnri.execute-api.eu-north-1.amazonaws.com';

  constructor(private http: HttpClient) {}

  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.setLoading(true);
    return this.http.post<User>(`${this.BASE_URL}/login`, credentials).pipe(
      tap(user => this.setAuthState(user, true)),
      catchError(err => {
        this.setAuthState(null, false);
        return throwError(() => new Error(err.error?.message || 'Login failed'));
      }),
      tap(() => this.setLoading(false))
    );
  }

  register(data: RegisterData): Observable<User> {
    this.setLoading(true);
    return this.http.post<User>(`${this.BASE_URL}/register`, data).pipe(
      tap(user => this.setAuthState(user, true)),
      catchError(err => {
        this.setAuthState(null, false);
        return throwError(() => new Error(err.error?.message || 'Registration failed'));
      }),
      tap(() => this.setLoading(false))
    );
  }

  logout(): void {
    this.setAuthState(null, false);
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Not authenticated'));
    }

    return this.http.put<User>(`${this.BASE_URL}/profile`, updates).pipe(
      tap(updatedUser => this.setAuthState(updatedUser, true)),
      catchError(err => throwError(() => new Error(err.error?.message || 'Update failed')))
    );
  }

  private setLoading(loading: boolean): void {
    this.authState.next({
      ...this.authState.value,
      isLoading: loading
    });
  }

  private setAuthState(user: User | null, isAuthenticated: boolean): void {
    this.authState.next({
      user,
      isAuthenticated,
      isLoading: false
    });
  }
}
