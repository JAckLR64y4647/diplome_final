import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterData } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join TaskFlow and start managing your tasks</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                [(ngModel)]="registerData.firstName"
                required
                placeholder="First name"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                [(ngModel)]="registerData.lastName"
                required
                placeholder="Last name"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="registerData.email"
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
              [(ngModel)]="registerData.password"
              required
              minlength="6"
              placeholder="Create a password (min 6 characters)"
              class="form-control"
              [class.error]="error"
            />
          </div>

          <div class="error-message" *ngIf="error">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="!registerForm.form.valid || isLoading"
          >
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? 
            <button type="button" class="link-button" (click)="switchToLogin()">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      padding: 1rem;
    }

    .auth-card {
      background: var(--color-surface);
      border-radius: 16px;
      padding: 2rem;
      max-width: 900px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--color-border);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: var(--color-text);
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--color-surface);
      color: var(--color-text);
      transition: all 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control.error {
      border-color: var(--color-error);
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.875rem;
      text-align: center;
      padding: 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 6px;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-secondary);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-full {
      width: 100%;
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

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .auth-footer p {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .link-button {
      background: none;
      border: none;
      color: var(--color-primary);
      cursor: pointer;
      text-decoration: underline;
      font-size: inherit;
    }

    .link-button:hover {
      color: var(--color-secondary);
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent {
  @Output() switchMode = new EventEmitter<'login'>();

  registerData: RegisterData = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  error = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.error = '';
    this.isLoading = true;

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  switchToLogin(): void {
    this.switchMode.emit('login');
  }
}