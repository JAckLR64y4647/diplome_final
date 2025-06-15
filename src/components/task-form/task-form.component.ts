import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-form-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="task-form" (click)="$event.stopPropagation()">
        <div class="task-form-header">
          <h2>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h2>
          <button class="btn-close" (click)="closeForm()" type="button">&times;</button>
        </div>

        <form (ngSubmit)="onSubmit()" #taskForm="ngForm">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="formData.title"
              required
              placeholder="Enter task title"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="formData.description"
              placeholder="Enter task description"
              rows="3"
              class="form-control"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" name="status" [(ngModel)]="formData.status" class="form-control">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" name="priority" [(ngModel)]="formData.priority" class="form-control">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                [(ngModel)]="formData.category"
                placeholder="e.g., Work, Personal"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                [(ngModel)]="formData.dueDate"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="closeForm()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!taskForm.form.valid">
              {{ editingTask ? 'Update Task' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .task-form-overlay {
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

    .task-form {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .task-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .task-form-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: #f3f4f6;
      color: #374151;
    }

    form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 2rem;
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
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 640px) {
      .task-form {
        margin: 0.5rem;
        max-height: 95vh;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .task-form-header {
        padding: 1rem;
      }

      form {
        padding: 1rem;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() isVisible = false;
  @Input() editingTask: Task | null = null;
  @Output() taskSubmit = new EventEmitter<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() formClose = new EventEmitter<void>();

  formData = {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: '',
    dueDate: ''
  };

  ngOnInit() {
    if (this.editingTask) {
      this.formData = {
        title: this.editingTask.title,
        description: this.editingTask.description,
        status: this.editingTask.status,
        priority: this.editingTask.priority,
        category: this.editingTask.category,
        dueDate: this.editingTask.dueDate ? 
          this.editingTask.dueDate.toISOString().split('T')[0] : ''
      };
    }
  }

  onSubmit() {
    if (this.formData.title.trim()) {
      const taskData = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        status: this.formData.status,
        priority: this.formData.priority,
        category: this.formData.category.trim(),
        dueDate: this.formData.dueDate ? new Date(this.formData.dueDate) : null
      };

      this.taskSubmit.emit(taskData);
      this.closeForm();
    }
  }

  closeForm() {
    this.formClose.emit();
    this.resetForm();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeForm();
    }
  }

  private resetForm() {
    this.formData = {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      category: '',
      dueDate: ''
    };
  }
}