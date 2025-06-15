import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your account information and preferences</p>
      </div>

      <div class="profile-content">
        <div class="profile-section">
          <div class="section-header">
            <h3>Personal Information</h3>
          </div>

          <form (ngSubmit)="updateProfile()" #profileForm="ngForm" class="profile-form">
            <div class="avatar-section">
              <div class="current-avatar">
                <img *ngIf="currentUser?.avatar" [src]="currentUser?.avatar" [alt]="currentUser?.firstName">
                <div *ngIf="!currentUser?.avatar" class="avatar-placeholder">
                  {{ getInitials() }}
                </div>
              </div>
              <div class="avatar-actions">
                <button type="button" class="btn btn-secondary">Change Avatar</button>
                <p class="avatar-help">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  [(ngModel)]="profileData.firstName"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  [(ngModel)]="profileData.lastName"
                  required
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
                [(ngModel)]="profileData.email"
                required
                email
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                [value]="currentUser?.role"
                readonly
                class="form-control readonly"
              />
              <p class="field-help">Your role is managed by administrators</p>
            </div>

            <div class="success-message" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                Reset Changes
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="!profileForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="loading-spinner"></span>
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="profile-section">
          <div class="section-header">
            <h3>Account Information</h3>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Member Since</label>
              <span>{{ formatDate(currentUser?.createdAt) }}</span>
            </div>

            <div class="info-item">
              <label>Last Updated</label>
              <span>{{ formatDate(currentUser?.updatedAt) }}</span>
            </div>

            <div class="info-item">
              <label>Account Status</label>
              <span class="status-badge active">Active</span>
            </div>

            <div class="info-item">
              <label>User ID</label>
              <span class="user-id">{{ currentUser?.id }}</span>
            </div>
          </div>
        </div>

        <div class="profile-section danger-section">
          <div class="section-header">
            <h3>Danger Zone</h3>
            <p>These actions cannot be undone</p>
          </div>

          <div class="danger-actions">
            <button type="button" class="btn btn-danger" (click)="confirmDeleteAccount()">
              Delete Account
            </button>
            <p class="danger-help">
              This will permanently delete your account and all associated data.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--color-background);
    }

    .profile-header {
      margin-bottom: 2rem;
    }

    .profile-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .profile-header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 2rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .section-header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: var(--color-background);
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }

    .current-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .current-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .avatar-actions {
      flex: 1;
    }

    .avatar-help {
      margin: 0.5rem 0 0 0;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
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

    .form-control.readonly {
      background: var(--color-background);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }

    .field-help {
      margin: 0.25rem 0 0 0;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .success-message {
      color: var(--color-success);
      font-size: 0.875rem;
      text-align: center;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 6px;
      border: 1px solid var(--color-success);
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.875rem;
      text-align: center;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 6px;
      border: 1px solid var(--color-error);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
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

    .btn-secondary {
      background: var(--color-background);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    .btn-danger {
      background: var(--color-error);
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
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

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      font-size: 0.875rem;
      color: var(--color-text);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: fit-content;
    }

    .status-badge.active {
      background: var(--color-success);
      color: white;
    }

    .user-id {
      font-family: monospace;
      font-size: 0.75rem;
      background: var(--color-background);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--color-border);
    }

    .danger-section {
      border-color: var(--color-error);
    }

    .danger-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .danger-help {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-section {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileData = {
    firstName: '',
    lastName: '',
    email: ''
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
      if (this.currentUser) {
        this.profileData = {
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          email: this.currentUser.email
        };
      }
    });
  }

  updateProfile() {
    if (this.isLoading) return;

    this.clearMessages();
    this.isLoading = true;

    this.authService.updateProfile(this.profileData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to update profile. Please try again.';
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  resetForm() {
    if (this.currentUser) {
      this.profileData = {
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email
      };
    }
    this.clearMessages();
  }

  confirmDeleteAccount() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    
    if (confirmed) {
      const doubleConfirm = confirm(
        'This is your final warning. Deleting your account will remove all your tasks, messages, and profile information permanently. Type "DELETE" to confirm.'
      );
      
      if (doubleConfirm) {
        // In a real app, this would call a delete account service
        alert('Account deletion is not implemented in this demo.');
      }
    }
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}