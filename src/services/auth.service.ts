import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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

  private readonly STORAGE_KEY = 'task-management-auth';
  private readonly USERS_KEY = 'task-management-users';

  constructor() {
    this.loadAuthState();
  }

  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.setLoading(true);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const users = this.getStoredUsers();
        const user = users.find(u => 
          u.email === credentials.email && 
          this.validatePassword(credentials.password, u.email)
        );

        if (!user) {
          throw new Error('Invalid email or password');
        }

        this.setAuthState(user, true);
        this.saveAuthState();
        return user;
      })
    );
  }

  register(data: RegisterData): Observable<User> {
    this.setLoading(true);
    
    return of(null).pipe(
      delay(1000),
      map(() => {
        const users = this.getStoredUsers();
        
        if (users.find(u => u.email === data.email)) {
          throw new Error('User with this email already exists');
        }

        const newUser: User = {
          id: this.generateId(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
          isOnline: true
        };

        users.push(newUser);
        this.saveUsers(users);
        this.setAuthState(newUser, true);
        this.saveAuthState();
        
        return newUser;
      })
    );
  }

  logout(): void {
    this.setAuthState(null, false);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const updatedUser = { ...currentUser, ...updates, updatedAt: new Date() };
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          this.saveUsers(users);
        }

        this.setAuthState(updatedUser, true);
        this.saveAuthState();
        return updatedUser;
      })
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

  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        if (authData.user) {
          this.setAuthState({
            ...authData.user,
            createdAt: new Date(authData.user.createdAt),
            updatedAt: new Date(authData.user.updatedAt)
          }, true);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }

  private saveAuthState(): void {
    try {
      const authData = {
        user: this.authState.value.user,
        isAuthenticated: this.authState.value.isAuthenticated
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      if (stored) {
        return JSON.parse(stored).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    
    // Return default admin user if no users exist
    const defaultAdmin: User = {
      id: 'admin-1',
      email: 'admin@taskflow.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOnline: false
    };
    
    this.saveUsers([defaultAdmin]);
    return [defaultAdmin];
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  private validatePassword(password: string, email: string): boolean {
    return password.length >= 6;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}