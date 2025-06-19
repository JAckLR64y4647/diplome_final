import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';
import { EditUserComponent } from '../users/edit-user.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EditUserComponent],
  template: `
    <div class="users-container">
      <div class="users-header">
        <div class="header-content">
          <h2>Team Members</h2>
          <p>Manage your team members and their permissions</p>
        </div>
        <button class="btn btn-primary" (click)="addUser()">
          ➕ Add User
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

      <!-- Edit User Modal -->
      <app-edit-user 
        [show]="showEditModal" 
        [user]="selectedUser"
        [currentUserRole]="currentUser?.role || UserRole.USER"
        (saveUser)="onSaveUser($event)"
        (closeModal)="closeEditModal()"
      ></app-edit-user>

      <!-- Add User Modal -->
      <app-edit-user 
        [show]="showAddModal" 
        [currentUserRole]="currentUser?.role || UserRole.USER"
        (saveUser)="onAddUser($event)"
        (closeModal)="closeAddModal()"
      ></app-edit-user>
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
      background: var(--color-primary-dark);
      transform: translateY(-1px);
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
    }
  `]
})
export class UsersListComponent implements OnInit {
  currentUser: User | null = null;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  roleFilter = '';
  
  showEditModal = false;
  showAddModal = false;
  selectedUser: User | null = null;
  
  UserRole = UserRole;
  API_URL = 'https://j77dm4enbe.execute-api.eu-north-1.amazonaws.com/k3r5irs';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
      this.loadUsers();
    });
  }

  loadUsers() {
    fetch(`${this.API_URL}/users`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
      })
      .then(data => {
        this.allUsers = data;

        if (this.currentUser && !this.allUsers.find(u => u.id === this.currentUser!.id)) {
          this.allUsers.unshift(this.currentUser);
        }

        this.filterUsers();
      })
      .catch(error => console.error('Error loading users:', error));
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

  onAddUser(newUser: User) {
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();
    newUser.isOnline = false;

    fetch(`${this.API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add user');
        return response.json();
      })
      .then(createdUser => {
        this.allUsers.push(createdUser);
        this.filterUsers();
        this.closeAddModal();
      })
      .catch(error => console.error('Add user failed:', error));
  }

  onSaveUser(updatedUser: User) {
    fetch(`${this.API_URL}/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update user');
        const index = this.allUsers.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) this.allUsers[index] = updatedUser;
        this.filterUsers();
        this.closeEditModal();
      })
      .catch(error => console.error('Update failed:', error));
  }

  removeUser(user: User) {
    if (!confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName}?`)) return;

    fetch(`${this.API_URL}/users/${user.id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete user');
        this.allUsers = this.allUsers.filter(u => u.id !== user.id);
        this.filterUsers();
      })
      .catch(error => console.error('Delete failed:', error));
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  addUser() {
    this.showAddModal = true;
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  getInitials(user: User): string {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'user': return 'User';
      default: return 'Unknown';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  canManageUser(user: User): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.id === user.id;
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm || this.roleFilter) return 'Try adjusting your filters or search.';
    return 'No users have been added yet.';
  }
}