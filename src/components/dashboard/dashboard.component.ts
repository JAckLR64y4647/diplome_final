import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, {{ currentUser?.firstName }}!</h1>
          <p>Here's what's happening with your tasks today.</p>
        </div>
        <div class="date-info">
          <span class="current-date">{{ getCurrentDate() }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
        </div>

        <div class="stat-card todo">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.todo }}</div>
            <div class="stat-label">To Do</div>
          </div>
        </div>

        <div class="stat-card progress">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.completed }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Recent Tasks</h2>
            <span class="section-count">{{ recentTasks.length }} tasks</span>
          </div>
          
          <div class="task-list" *ngIf="recentTasks.length > 0; else noRecentTasks">
            <div class="task-item" *ngFor="let task of recentTasks">
              <div class="task-status">
                <span class="status-indicator" [class]="'status-' + task.status"></span>
              </div>
              <div class="task-details">
                <h3 class="task-title">{{ task.title }}</h3>
                <p class="task-meta">
                  <span class="task-priority" [class]="'priority-' + task.priority">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <span class="task-date">{{ formatRelativeDate(task.createdAt) }}</span>
                </p>
              </div>
              <div class="task-actions">
                <span class="task-category" *ngIf="task.category">{{ task.category }}</span>
              </div>
            </div>
          </div>

          <ng-template #noRecentTasks>
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <p>No recent tasks found</p>
            </div>
          </ng-template>
        </div>

        <div class="dashboard-section">
          <div class="section-header">
            <h2>Overdue Tasks</h2>
            <span class="section-count overdue" *ngIf="overdueTasks.length > 0">
              {{ overdueTasks.length }} overdue
            </span>
          </div>
          
          <div class="task-list" *ngIf="overdueTasks.length > 0; else noOverdueTasks">
            <div class="task-item overdue-item" *ngFor="let task of overdueTasks">
              <div class="task-status">
                <span class="status-indicator overdue-indicator"></span>
              </div>
              <div class="task-details">
                <h3 class="task-title">{{ task.title }}</h3>
                <p class="task-meta">
                  <span class="task-due-date">Due {{ formatDate(task.dueDate!) }}</span>
                  <span class="overdue-days">{{ getOverdueDays(task.dueDate!) }} days overdue</span>
                </p>
              </div>
              <div class="task-actions">
                <span class="priority-badge" [class]="'priority-' + task.priority">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
            </div>
          </div>

          <ng-template #noOverdueTasks>
            <div class="empty-state">
              <div class="empty-icon">🎉</div>
              <p>No overdue tasks!</p>
            </div>
          </ng-template>
        </div>
      </div>

      <div class="dashboard-section">
        <div class="section-header">
          <h2>Progress Overview</h2>
        </div>
        
        <div class="progress-section">
          <div class="progress-item">
            <div class="progress-label">
              <span>Completion Rate</span>
              <span class="progress-percentage">{{ getCompletionRate() }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getCompletionRate()"></div>
            </div>
          </div>

          <div class="priority-breakdown">
            <h3>Tasks by Priority</h3>
            <div class="priority-list">
              <div class="priority-item" *ngFor="let item of priorityBreakdown">
                <span class="priority-color" [class]="'priority-' + item.priority"></span>
                <span class="priority-name">{{ item.label }}</span>
                <span class="priority-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      background: var(--color-background);
      min-height: 100%;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .welcome-section h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .welcome-section p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    .current-date {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      background: var(--color-surface);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-card.total .stat-icon { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); }
    .stat-card.todo .stat-icon { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
    .stat-card.progress .stat-icon { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
    .stat-card.completed .stat-icon { background: linear-gradient(135deg, #34d399, #10b981); }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .dashboard-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .section-count {
      background: var(--color-background);
      color: var(--color-text-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .section-count.overdue {
      background: var(--color-error);
      color: white;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .task-item:hover {
      border-color: var(--color-primary);
    }

    .task-item.overdue-item {
      border-color: var(--color-error);
      background: rgba(239, 68, 68, 0.05);
    }

    .task-status {
      flex-shrink: 0;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: block;
    }

    .status-indicator.status-todo { background: var(--color-warning); }
    .status-indicator.status-in-progress { background: var(--color-primary); }
    .status-indicator.status-completed { background: var(--color-success); }
    .overdue-indicator { background: var(--color-error); }

    .task-details {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-meta {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .task-priority {
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .task-priority.priority-low { background: #f3f4f6; color: #374151; }
    .task-priority.priority-medium { background: #fef3c7; color: #92400e; }
    .task-priority.priority-high { background: #fed7aa; color: #c2410c; }
    .task-priority.priority-critical { background: #fecaca; color: #dc2626; }

    .task-actions {
      flex-shrink: 0;
    }

    .task-category {
      background: var(--color-primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-badge.priority-low { background: #f3f4f6; color: #374151; }
    .priority-badge.priority-medium { background: #fef3c7; color: #92400e; }
    .priority-badge.priority-high { background: #fed7aa; color: #c2410c; }
    .priority-badge.priority-critical { background: #fecaca; color: #dc2626; }

    .overdue-days {
      color: var(--color-error);
      font-weight: 500;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .progress-item {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .progress-percentage {
      font-weight: 600;
      color: var(--color-primary);
    }

    .progress-bar {
      height: 8px;
      background: var(--color-background);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .priority-breakdown h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .priority-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .priority-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .priority-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .priority-color.priority-low { background: #9ca3af; }
    .priority-color.priority-medium { background: var(--color-warning); }
    .priority-color.priority-high { background: #f97316; }
    .priority-color.priority-critical { background: var(--color-error); }

    .priority-name {
      flex: 1;
      font-size: 0.875rem;
      color: var(--color-text);
    }

    .priority-count {
      font-weight: 600;
      color: var(--color-text);
      background: var(--color-background);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  recentTasks: Task[] = [];
  overdueTasks: Task[] = [];

  stats = {
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0
  };

  priorityBreakdown = [
    { priority: TaskPriority.LOW, label: 'Low Priority', count: 0 },
    { priority: TaskPriority.MEDIUM, label: 'Medium Priority', count: 0 },
    { priority: TaskPriority.HIGH, label: 'High Priority', count: 0 },
    { priority: TaskPriority.CRITICAL, label: 'Critical Priority', count: 0 }
  ];

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
    });

    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.updateStats();
      this.updateRecentTasks();
      this.updateOverdueTasks();
      this.updatePriorityBreakdown();
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    };
    return labels[priority];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  getOverdueDays(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = now.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getCompletionRate(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.completed / this.stats.total) * 100);
  }

  private updateStats() {
    this.stats = {
      total: this.tasks.length,
      todo: this.tasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: this.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: this.tasks.filter(t => t.status === TaskStatus.COMPLETED).length
    };
  }

  private updateRecentTasks() {
    this.recentTasks = this.tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  private updateOverdueTasks() {
    const now = new Date();
    this.overdueTasks = this.tasks
      .filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== TaskStatus.COMPLETED
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }

  private updatePriorityBreakdown() {
    this.priorityBreakdown.forEach(item => {
      item.count = this.tasks.filter(task => task.priority === item.priority).length;
    });
  }
}