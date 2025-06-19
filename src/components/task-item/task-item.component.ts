import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-item" [class.completed]="task.status === TaskStatus.COMPLETED">
      <div class="task-content">
        <div class="task-header">
          <div class="task-status-priority">
            <span class="status-badge" [class]="'status-' + task.status">
              {{ getStatusLabel(task.status) }}
            </span>
            <span class="priority-badge" [class]="'priority-' + task.priority">
              {{ getPriorityLabel(task.priority) }}
            </span>
          </div>
          <div class="task-actions">
            <button class="btn-action edit" (click)="onEdit()" title="Edit task">
              ✏️
            </button>
            <button class="btn-action delete" (click)="onDelete()" title="Delete task">
              🗑️
            </button>
          </div>
        </div>

        <h3 class="task-title">{{ task.title }}</h3>
        
        <p class="task-description" *ngIf="task.description">
          {{ task.description }}
        </p>

        <div class="task-meta">
          <span class="task-category" *ngIf="task.category">
            📁 {{ task.category }}
          </span>
          
          <span class="task-due-date" *ngIf="task.dueDate" [class.overdue]="isOverdue()">
            📅 {{ formatDate(task.dueDate) }}
          </span>
        </div>

        <div class="task-footer">
          <span class="task-created">
            Created {{ formatRelativeDate(task.createdAt) }}
          </span>
          
          <div class="status-actions">
            <button 
              *ngIf="task.status !== TaskStatus.TODO"
              class="btn-status"
              (click)="onStatusChange(TaskStatus.TODO)"
            >
              ⏪ To Do
            </button>
            <button 
              *ngIf="task.status !== TaskStatus.IN_PROGRESS"
              class="btn-status"
              (click)="onStatusChange(TaskStatus.IN_PROGRESS)"
            >
              ⚡ In Progress
            </button>
            <button 
              *ngIf="task.status !== TaskStatus.COMPLETED"
              class="btn-status"
              (click)="onStatusChange(TaskStatus.COMPLETED)"
            >
              ✅ Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-item {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .task-item:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .task-item.completed {
      opacity: 0.8;
      background: #f9fafb;
    }

    .task-content {
      padding: 1.5rem;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .task-status-priority {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .status-badge, .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-todo { background: #fef3c7; color: #92400e; }
    .status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }

    .priority-low { background: #f3f4f6; color: #374151; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fed7aa; color: #c2410c; }
    .priority-critical { background: #fecaca; color: #dc2626; }

    .task-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      opacity: 0.6;
    }

    .btn-action:hover {
      opacity: 1;
      background: #f3f4f6;
    }

    .task-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .task-item.completed .task-title {
      text-decoration: line-through;
      color: #6b7280;
    }

    .task-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
      font-size: 0.875rem;
    }

    .task-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .task-category, .task-due-date {
      font-size: 0.75rem;
      color: #6b7280;
      background: #f9fafb;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .task-due-date.overdue {
      background: #fecaca;
      color: #dc2626;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .task-created {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .status-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-status {
      background: #f3f4f6;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #374151;
    }

    .btn-status:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }

    @media (max-width: 640px) {
      .task-content {
        padding: 1rem;
      }

      .task-header {
        flex-direction: column;
        gap: 0.75rem;
      }

      .task-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .status-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class TaskItemComponent {
  TaskStatus = TaskStatus;

  @Input() task!: Task;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() updateTaskStatus = new EventEmitter<{ id: string, status: TaskStatus }>();

  onEdit() {
    this.editTask.emit(this.task);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      this.deleteTask.emit(this.task.id);
    }
  }

  onStatusChange(status: TaskStatus) {
    this.updateTaskStatus.emit({ id: this.task.id, status });
  }

  getStatusLabel(status: TaskStatus): string {
    const labels = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed'
    };
    return labels[status] || '';
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels = {
      [TaskPriority.LOW]: 'Low',
      [TaskPriority.MEDIUM]: 'Medium',
      [TaskPriority.HIGH]: 'High',
      [TaskPriority.CRITICAL]: 'Critical'
    };
    return labels[priority] || '';
  }

  isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === TaskStatus.COMPLETED) {
      return false;
    }
    return new Date(this.task.dueDate) < new Date();
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
}
