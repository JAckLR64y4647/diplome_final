import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus, TaskPriority, TaskFilter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly STORAGE_KEY = 'task-management-tasks';

  constructor() {
    this.loadTasksFromStorage();
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.unshift(task);
    this.updateTasksSubject();
    this.saveTasksToStorage();
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updates,
        updatedAt: new Date()
      };
      this.updateTasksSubject();
      this.saveTasksToStorage();
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.updateTasksSubject();
    this.saveTasksToStorage();
  }

  getFilteredTasks(filter: TaskFilter): Task[] {
    let filteredTasks = [...this.tasks];

    if (filter.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filter.status);
    }

    if (filter.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filter.priority);
    }

    if (filter.category) {
      filteredTasks = filteredTasks.filter(task => 
        task.category.toLowerCase().includes(filter.category!.toLowerCase())
      );
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sorting
    if (filter.sortBy) {
      filteredTasks.sort((a, b) => {
        let aValue: any = a[filter.sortBy!];
        let bValue: any = b[filter.sortBy!];

        if (filter.sortBy === 'priority') {
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
        }

        if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredTasks;
  }

  getCategories(): string[] {
    const categories = [...new Set(this.tasks.map(task => task.category))];
    return categories.filter(category => category.trim() !== '');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateTasksSubject(): void {
    this.tasksSubject.next([...this.tasks]);
  }

  private loadTasksFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tasks = JSON.parse(stored);
        this.tasks = tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : null
        }));
        this.updateTasksSubject();
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
    }
  }

  private saveTasksToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }
}
