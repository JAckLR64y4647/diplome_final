import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';
import { ThemeMode } from '../../models/theme.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo" *ngIf="!isCollapsed">
          <h2>TaskFlow</h2>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()">
          {{ isCollapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" 
              [class.active]="currentView === 'dashboard'"
              (click)="navigateTo('dashboard')">
            <span class="nav-icon">📊</span>
            <span class="nav-text" *ngIf="!isCollapsed">Dashboard</span>
          </li>
          
          <li class="nav-item" 
              [class.active]="currentView === 'kanban'"
              (click)="navigateTo('kanban')">
            <span class="nav-icon">📋</span>
            <span class="nav-text" *ngIf="!isCollapsed">Kanban Board</span>
          </li>
          
          <li class="nav-item" 
              [class.active]="currentView === 'tasks'"
              (click)="navigateTo('tasks')">
            <span class="nav-icon">✅</span>
            <span class="nav-text" *ngIf="!isCollapsed">Tasks</span>
          </li>
          
          <li class="nav-item" 
              [class.active]="currentView === 'chat'"
              (click)="navigateTo('chat')">
            <span class="nav-icon">💬</span>
            <span class="nav-text" *ngIf="!isCollapsed">Team Chat</span>
            <span class="badge" *ngIf="unreadCount > 0 && !isCollapsed">{{ unreadCount }}</span>
          </li>
          
          <li class="nav-item" 
              [class.active]="currentView === 'users'"
              (click)="navigateTo('users')">
            <span class="nav-icon">👥</span>
            <span class="nav-text" *ngIf="!isCollapsed">Users</span>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="theme-toggle" *ngIf="!isCollapsed">
          <button class="theme-btn" (click)="toggleTheme()">
            <span class="theme-icon">{{ currentTheme === 'dark' ? '☀️' : '🌙' }}</span>
            <span class="theme-text">{{ currentTheme === 'dark' ? 'Light' : 'Dark' }} Mode</span>
          </button>
        </div>

        <div class="user-profile" *ngIf="currentUser">
          <div class="user-avatar">
            <img *ngIf="currentUser.avatar" [src]="currentUser?.avatar" [alt]="currentUser?.firstName">
            <span *ngIf="!currentUser.avatar" class="avatar-placeholder">
              {{ currentUser.firstName[0] }}{{ currentUser.lastName[0] }}
            </span>
          </div>
          <div class="user-info" *ngIf="!isCollapsed">
            <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
            <div class="user-role">{{ currentUser.role }}</div>
          </div>
          <div class="user-actions" *ngIf="!isCollapsed">
            <button class="action-btn" (click)="navigateTo('profile')" title="Profile Settings">
              ⚙️
            </button>
            <button class="action-btn" (click)="logout()" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 80px;
    }

    .logo h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .toggle-btn {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .toggle-btn:hover {
      background: var(--color-border);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      gap: 1rem;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem;
    }

    .nav-item:hover {
      background: var(--color-background);
    }

    .nav-item.active {
      background: var(--color-primary);
      color: white;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-accent);
    }

    .nav-icon {
      font-size: 1.25rem;
      min-width: 24px;
      text-align: center;
    }

    .nav-text {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .badge {
      background: var(--color-error);
      color: white;
      border-radius: 10px;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--color-border);
    }

    .theme-toggle {
      margin-bottom: 1rem;
    }

    .theme-btn {
      width: 100%;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      color: var(--color-text);
    }

    .theme-btn:hover {
      background: var(--color-border);
    }

    .theme-icon {
      font-size: 1.125rem;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--color-background);
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }

    .sidebar.collapsed .user-profile {
      justify-content: center;
      padding: 0.5rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
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
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: capitalize;
    }

    .user-actions {
      display: flex;
      gap: 0.25rem;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 0.25rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .action-btn:hover {
      background: var(--color-border);
      opacity: 1;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() currentView = 'dashboard';
  @Input() unreadCount = 0;
  @Output() viewChange = new EventEmitter<string>();
  @Output() sidebarToggle = new EventEmitter<boolean>();

  isCollapsed = false;
  currentUser: User | null = null;
  currentTheme = 'light';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
    });

    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme.name;
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggle.emit(this.isCollapsed);
  }

  navigateTo(view: string) {
    this.viewChange.emit(view);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}