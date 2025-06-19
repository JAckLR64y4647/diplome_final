import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskFilter } from '../models/task.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly BASE_URL = 'https://r9j9iupnri.execute-api.eu-north-1.amazonaws.com/585duu6/tasks';
  API_URL: any;

  constructor(private http: HttpClient) {
    this.fetchTasks();
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  fetchTasks(): void {
    this.http.get<Task[]>(this.BASE_URL).subscribe({
      next: tasks => this.tasksSubject.next(tasks),
      error: err => console.error('Fetch tasks failed', err)
    });
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.http.post<Task>(this.BASE_URL, task).subscribe({
      next: () => this.fetchTasks(),
      error: err => console.error('Add task failed', err)
    });
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this.http.put(`${this.BASE_URL}/${id}`, updates).subscribe({
      next: () => this.fetchTasks(),
      error: err => console.error('Update task failed', err)
    });
  }

  deleteTask(id: string): void {
    this.http.delete(`${this.BASE_URL}/${id}`).subscribe({
      next: () => this.fetchTasks(),
      error: err => console.error('Delete task failed', err)
    });
  }

  getFilteredTasks(filter: TaskFilter): Observable<Task[]> {
    return this.getTasks().pipe(
      map(tasks => {
        let filtered = [...tasks];

        if (filter.status) filtered = filtered.filter(t => t.status === filter.status);
        if (filter.priority) filtered = filtered.filter(t => t.priority === filter.priority);
        if (filter.category) filtered = filtered.filter(t =>
          t.category.toLowerCase().includes(filter.category!.toLowerCase())
        );
        if (filter.search) {
          const term = filter.search.toLowerCase();
          filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)
          );
        }

        if (filter.sortBy) {
          filtered.sort((a, b) => {
            let aVal: any = a[filter.sortBy!];
            let bVal: any = b[filter.sortBy!];
            if (filter.sortBy === 'priority') {
              const order = { low: 1, medium: 2, high: 3, critical: 4 };
              aVal = order[a.priority];
              bVal = order[b.priority];
            }
            return filter.sortOrder === 'asc'
              ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0
              : aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          });
        }

        return filtered;
      })
    );
  }

  getCategories(): Observable<string[]> {
  return this.http.get<string[]>(`${this.API_URL}/categories`);
}
}
