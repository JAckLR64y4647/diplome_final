import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <div class="users-header">
        <div class="header-content">
          <h2>Team Members</h2>
          <p>Manage your team and user permissions</p>
        </div>
        <button class="btn btn-primary" (click)="openInviteModal()">
          ➕ Invite User
        </button>
      </div>

      <div class="users-filters">
        <div class="search-container">
          <input
            type="text"
            placeholder="Search users..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterUsers()"
            class="search-input"
          />
        </div>
        
        <div class="filter-container">
          <select [(ngModel)]="roleFilter" (ngModelChange)="filterUsers()" class="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div class="users-grid">
        <div class="user-card" *ngFor="let user of filteredUsers">
          <div class="user-avatar">
            <img *ngIf="user.avatar" [src]="user.avatar" [alt]="user.firstName">
            <div *ngIf="!user.avatar" class="avatar-placeholder">
              {{ getInitials(user) }}
            </div>
            <div class="online-status" [class.online]="user.isOnline"></div>
          </div>

          <div class="user-info">
            <h3 class="user-name">{{ user.firstName }} {{ user.lastName }}</h3>
            <p class="user-email">{{ user.email }}</p>
            
            <div class="user-meta">
              <span class="role-badge" [class]="'role-' + user.role">
                {{ getRoleLabel(user.role) }}
              </span>
              <span class="join-date">
                Joined {{ formatDate(user.createdAt) }}
              </span>
            </div>

            <div class="user-status">
              <span class="status-text" [class.online]="user.isOnline">
                {{ user.isOnline ? 'Online' : 'Offline' }}
              </span>
              <span class="last-seen" *ngIf="!user.isOnline && user.lastSeen">
                Last seen {{ formatRelativeDate(user.lastSeen) }}
              </span>
            </div>
          </div>

          <div class="user-actions" *ngIf="canManageUser(user)">
            <button class="action-btn" (click)="editUser(user)" title="Edit User">
              ✏️
            </button>
            <button class="action-btn danger" (click)="removeUser(user)" title="Remove User">
              🗑️
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredUsers.length === 0">
          <div class="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>{{ getEmptyStateMessage() }}</p>
        </div>
      </div>

      <!-- Invite Modal -->
      <div class="modal-overlay" *ngIf="showInviteModal" (click)="closeInviteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Invite New User</h3>
            <button class="modal-close" (click)="closeInviteModal()">&times;</button>
          </div>

          <form (ngSubmit)="sendInvite()" #inviteForm="ngForm" class="invite-form">
            <div class="form-group">
              <label for="inviteEmail">Email Address</label>
              <input
                type="email"
                id="inviteEmail"
                name="inviteEmail"
                [(ngModel)]="inviteData.email"
                required
                email
                placeholder="Enter email address"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="inviteRole">Role</label>
              <select id="inviteRole" name="inviteRole" [(ngModel)]="inviteData.role" class="form-control">
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin"  *ngIf="currentUser?.role === 'admin'">Admin</option>
              </select>
            </div>

            <div class="form-group">
              <label for="inviteMessage">Personal Message (Optional)</label>
              <textarea
                id="inviteMessage"
                name="inviteMessage"
                [(ngModel)]="inviteData.message"
                placeholder="Add a personal message to the invitation..."
                rows="3"
                class="form-control"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeInviteModal()">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!inviteForm.form.valid">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 2rem;
      background: var(--color-background);
      min-height: 100%;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-content h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .header-content p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
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

    .btn-primary:hover {
      background: var(--color-secondary);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--color-background);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    .users-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--color-surface);
      color: var(--color-text);
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.875rem;
      background: var(--color-surface);
      color: var(--color-text);
      min-width: 120px;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .user-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
      position: relative;
    }

    .user-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .user-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto 1rem auto;
      position: relative;
    }

    .user-avatar img {
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
      font-size: 1.25rem;
    }

    .online-status {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-text-secondary);
      border: 2px solid var(--color-surface);
    }

    .online-status.online {
      background: var(--color-success);
    }

    .user-info {
      text-align: center;
    }

    .user-name {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .user-email {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      align-self: center;
    }

    .role-badge.role-admin {
      background: var(--color-error);
      color: white;
    }

    .role-badge.role-manager {
      background: var(--color-warning);
      color: white;
    }

    .role-badge.role-user {
      background: var(--color-background);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .join-date {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .user-status {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: center;
    }

    .status-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .status-text.online {
      color: var(--color-success);
    }

    .last-seen {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .user-actions {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .user-card:hover .user-actions {
      opacity: 1;
    }

    .action-btn {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--color-border);
    }

    .action-btn.danger:hover {
      background: var(--color-error);
      border-color: var(--color-error);
      color: white;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .empty-state p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

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

    .invite-form {
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

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }

    @media (max-width: 768px) {
      .users-container {
        padding: 1rem;
      }

      .users-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .users-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .users-grid {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UsersListComponent implements OnInit {
  currentUser: User | null = null;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  roleFilter = '';
  showInviteModal = false;

  inviteData = {
    email: '',
    role: UserRole.USER,
    message: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
    });

    this.loadUsers();
  }

  loadUsers() {
    // In a real app, this would fetch from a users service
    // For demo purposes, we'll create some mock users
    this.allUsers = [
      {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.MANAGER,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
        isOnline: true
      },
      {
        id: 'user-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.USER,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-12-19'),
        isOnline: false,
        lastSeen: new Date('2024-12-19')
      },
      {
        id: 'user-3',
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: UserRole.USER,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-12-18'),
        isOnline: true
      }
    ];

    // Add current user if not already in list
    if (this.currentUser && !this.allUsers.find(u => u.id === this.currentUser!.id)) {
      this.allUsers.unshift(this.currentUser);
    }

    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.allUsers.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.roleFilter || user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteData = {
      email: '',
      role: UserRole.USER,
      message: ''
    };
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  sendInvite() {
    // In a real app, this would send an invitation email
    alert(`Invitation sent to ${this.inviteData.email} with role: ${this.inviteData.role}`);
    this.closeInviteModal();
  }

  editUser(user: User) {
    // In a real app, this would open an edit modal
    alert(`Edit user: ${user.firstName} ${user.lastName}`);
  }

  removeUser(user: User) {
    if (confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} from the team?`)) {
      this.allUsers = this.allUsers.filter(u => u.id !== user.id);
      this.filterUsers();
    }
  }

  canManageUser(user: User): boolean {
    if (!this.currentUser) return false;
    if (user.id === this.currentUser.id) return false;
    
    // Only admins and managers can manage users
    return this.currentUser.role === UserRole.ADMIN || 
           (this.currentUser.role === UserRole.MANAGER && user.role === UserRole.USER);
  }

  getInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  getRoleLabel(role: UserRole): string {
    const labels = {
      'admin': 'Admin',
      'manager': 'Manager',
      'user': 'User'
    };
    return labels[role];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm || this.roleFilter) {
      return 'Try adjusting your search criteria or filters.';
    }
    return 'Invite team members to start collaborating.';
  }
}