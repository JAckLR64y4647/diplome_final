import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-left">
          <h1>Welcome Back</h1>
          <p>Sign in to your TaskFlow account</p>
          <div class="demo-box">
            <h3>Demo Credentials:</h3>
            <p><strong>Email:</strong> admintaskflow.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>

        <div class="login-right">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="credentials.email"
                required
                email
                placeholder="Enter your email"
                class="form-control"
                [class.error]="error"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="credentials.password"
                required
                minlength="6"
                placeholder="Enter your password"
                class="form-control"
                [class.error]="error"
              />
            </div>

            <div class="error-message" *ngIf="error">
              {{ error }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!loginForm.form.valid || isLoading"
            >
              <span *ngIf="isLoading" class="loading-spinner"></span>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div class="bottom-link">
            <p>Don't have an account? 
              <button type="button" class="link-button" (click)="switchToRegister()">
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      padding: 2rem;
    }

    .login-card {
      background: #ffffff;
      display: flex;
      flex-direction: row;
      border-radius: 16px;
      max-width: 900px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .login-left {
      flex: 1;
      background: #f9fafb;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .login-left h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .login-left p {
      font-size: 0.95rem;
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .demo-box {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.875rem;
    }

    .demo-box h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .login-right {
      flex: 1;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #111827;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .form-control.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      background: #fef2f2;
      padding: 0.5rem;
      font-size: 0.875rem;
      border-radius: 6px;
      text-align: center;
    }

    .btn {
      padding: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .bottom-link {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: #6b7280;
    }

    .link-button {
      background: none;
      border: none;
      color: #3b82f6;
      text-decoration: underline;
      cursor: pointer;
      font-size: inherit;
    }

    .link-button:hover {
      color: #2563eb;
    }

    @media (max-width: 768px) {
      .login-card {
        flex-direction: column;
      }

      .login-left, .login-right {
        padding: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  @Output() switchMode = new EventEmitter<'register'>();

  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  error = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.error = '';
    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  switchToRegister(): void {
    this.switchMode.emit('register');
  }
}
