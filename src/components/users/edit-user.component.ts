import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User, UserRole } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isNewUser ? 'Add New User' : 'Edit User' }}</h3>
          <button class="modal-close" (click)="close()">&times;</button>
        </div>

        <form #userForm="ngForm" class="user-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              [(ngModel)]="userData.firstName"
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
              [(ngModel)]="userData.lastName"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="userData.email"
              required
              email
              [disabled]="!isNewUser"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role" 
              name="role" 
              [(ngModel)]="userData.role" 
              class="form-control"
              [disabled]="!canEditRole"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin" *ngIf="currentUserRole === 'admin'">Admin</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="close()">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="save()"
              [disabled]="!userForm.form.valid"
            >
              {{ isNewUser ? 'Add User' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: var(--color-surface);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--color-border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: var(--color-background);
      color: var(--color-text);
    }

    .user-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      background: var(--color-background);
      color: var(--color-text);
      transition: all 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control:disabled {
      background: var(--color-border);
      cursor: not-allowed;
    }

    .modal-actions {
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
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--color-background);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    @media (max-width: 768px) {
      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class EditUserComponent {
  @Input() show = false;
  @Input() user: User | null = null;
  @Input() currentUserRole: UserRole = UserRole.USER;
  @Output() saveUser = new EventEmitter<User>();
  @Output() closeModal = new EventEmitter<void>();

  userData: User = {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  get isNewUser(): boolean {
    return !this.user?.id;
  }

  get canEditRole(): boolean {
    if (this.currentUserRole === UserRole.ADMIN) return true;
    if (this.currentUserRole === UserRole.MANAGER && this.userData.role !== UserRole.ADMIN) return true;
    return false;
  }

  ngOnChanges() {
    if (this.user) {
      this.userData = { ...this.user };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.userData = {
      id: '',
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  save() {
    this.saveUser.emit(this.userData);
  }

  close() {
    this.closeModal.emit();
  }
}