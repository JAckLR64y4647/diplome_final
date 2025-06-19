import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilter } from '../../models/task.model';
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
  styles: [/* залишаємо як є */]
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
    this.taskService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
}
