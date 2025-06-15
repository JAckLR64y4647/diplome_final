import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilter, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="filters-header">
        <h3>Filters & Search</h3>
        <button class="btn-clear" (click)="clearFilters()">Clear All</button>
      </div>

      <div class="search-container">
        <input
          type="text"
          placeholder="Search tasks..."
          [(ngModel)]="currentFilters.search"
          (ngModelChange)="onFilterChange()"
          class="search-input"
        />
      </div>

      <div class="filter-groups">
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="currentFilters.status" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Priority</label>
          <select [(ngModel)]="currentFilters.priority" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Category</label>
          <select [(ngModel)]="currentFilters.category" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <select [(ngModel)]="currentFilters.sortBy" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Order</label>
          <select [(ngModel)]="currentFilters.sortOrder" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .btn-clear {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-clear:hover {
      background: #e5e7eb;
    }

    .search-container {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
      transition: all 0.2s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    @media (max-width: 768px) {
      .filters-container {
        padding: 1rem;
      }

      .filter-groups {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .filters-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class TaskFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<TaskFilter>();

  currentFilters: TaskFilter = {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  categories: string[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.updateCategories();
    this.taskService.getTasks().subscribe(() => {
      this.updateCategories();
    });
  }

  onFilterChange() {
    this.filtersChange.emit({ ...this.currentFilters });
  }

  clearFilters() {
    this.currentFilters = {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.onFilterChange();
  }

  private updateCategories() {
    this.categories = this.taskService.getCategories();
  }
}