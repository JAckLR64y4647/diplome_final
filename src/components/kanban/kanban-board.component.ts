import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import { ChatService } from '../../services/chat.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskFormComponent],
  template: `
    <div class="kanban-container">
      <div class="kanban-header">
        <h2>Kanban Board</h2>
        <button class="btn btn-primary" (click)="openCreateForm()">
          ➕ Add Task
        </button>
      </div>

      <div class="kanban-board">
        <div class="kanban-column" *ngFor="let column of columns">
          <div class="column-header">
            <div class="column-title">
              <span class="column-icon">{{ column.icon }}</span>
              <h3>{{ column.title }}</h3>
              <span class="task-count">{{ column.tasks.length }}</span>
            </div>
          </div>

          <div 
            class="column-content"
            cdkDropList
            [cdkDropListData]="column.tasks"
            [cdkDropListConnectedTo]="getConnectedLists()"
            (cdkDropListDropped)="onTaskDrop($event)"
          >
            <div 
              class="task-card"
              *ngFor="let task of column.tasks"
              cdkDrag
              [cdkDragData]="task"
              (click)="openEditForm(task)"
            >
              <div class="task-card-header">
                <span class="priority-indicator" [class]="'priority-' + task.priority"></span>
                <div class="task-actions">
                  <button class="task-action-btn" (click)="$event.stopPropagation(); deleteTask(task.id)" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              <h4 class="task-title">{{ task.title }}</h4>
              
              <p class="task-description" *ngIf="task.description">
                {{ task.description }}
              </p>

              <div class="task-meta">
                <span class="task-category" *ngIf="task.category">
                  📁 {{ task.category }}
                </span>
                
                <span class="task-due-date" *ngIf="task.dueDate" [class.overdue]="isOverdue(task)">
                  📅 {{ formatDate(task.dueDate) }}
                </span>
              </div>

              <div class="task-footer">
                <span class="priority-badge" [class]="'priority-' + task.priority">
                  {{ getPriorityLabel(task.priority) }}
                </span>
                <span class="task-created">
                  {{ formatRelativeDate(task.createdAt) }}
                </span>
              </div>
            </div>

            <div class="empty-column" *ngIf="column.tasks.length === 0">
              <p>No tasks in {{ column.title.toLowerCase() }}</p>
              <button class="btn btn-ghost" (click)="openCreateFormWithStatus(column.status)">
                Add first task
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-task-form
        [isVisible]="showTaskForm"
        [editingTask]="editingTask"
        (taskSubmit)="onTaskSubmit($event)"
        (formClose)="closeTaskForm()"
      ></app-task-form>
    </div>
  `,
  styles: [`
    .kanban-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--color-background);
    }

    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .kanban-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text);
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

    .btn-ghost {
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px dashed var(--color-border);
    }

    .btn-ghost:hover {
      background: var(--color-background);
      color: var(--color-text);
    }

    .kanban-board {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 1.5rem 2rem;
      overflow-x: auto;
      min-height: 0;
    }

    .kanban-column {
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    .column-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .column-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .column-icon {
      font-size: 1.25rem;
    }

    .column-title h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text);
      flex: 1;
    }

    .task-count {
      background: var(--color-background);
      color: var(--color-text-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .column-content {
      flex: 1;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
      min-height: 200px;
    }

    .task-card {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .task-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .task-card.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .task-card.cdk-drag-placeholder {
      opacity: 0.4;
      background: var(--color-border);
    }

    .task-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .priority-indicator {
      width: 4px;
      height: 20px;
      border-radius: 2px;
    }

    .priority-indicator.priority-low { background: var(--color-text-secondary); }
    .priority-indicator.priority-medium { background: var(--color-warning); }
    .priority-indicator.priority-high { background: #f97316; }
    .priority-indicator.priority-critical { background: var(--color-error); }

    .task-actions {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .task-card:hover .task-actions {
      opacity: 1;
    }

    .task-action-btn {
      background: none;
      border: none;
      padding: 0.25rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .task-action-btn:hover {
      background: var(--color-error);
      opacity: 1;
    }

    .task-title {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.4;
    }

    .task-description {
      margin: 0 0 0.75rem 0;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .task-category, .task-due-date {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .task-due-date.overdue {
      color: var(--color-error);
      font-weight: 500;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border);
    }

    .priority-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .priority-badge.priority-low { background: #f3f4f6; color: #374151; }
    .priority-badge.priority-medium { background: #fef3c7; color: #92400e; }
    .priority-badge.priority-high { background: #fed7aa; color: #c2410c; }
    .priority-badge.priority-critical { background: #fecaca; color: #dc2626; }

    .task-created {
      font-size: 0.625rem;
      color: var(--color-text-secondary);
    }

    .empty-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      color: var(--color-text-secondary);
      flex: 1;
    }

    .empty-column p {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
    }

    .cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    @media (max-width: 1024px) {
      .kanban-board {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .kanban-column {
        min-height: 400px;
      }
    }

    @media (max-width: 768px) {
      .kanban-header {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .kanban-board {
        padding: 1rem;
      }
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  columns = [
    {
      title: 'To Do',
      status: TaskStatus.TODO,
      icon: '📝',
      tasks: [] as Task[]
    },
    {
      title: 'In Progress',
      status: TaskStatus.IN_PROGRESS,
      icon: '⚡',
      tasks: [] as Task[]
    },
    {
      title: 'Completed',
      status: TaskStatus.COMPLETED,
      icon: '✅',
      tasks: [] as Task[]
    }
  ];

  showTaskForm = false;
  editingTask: Task | null = null;
  defaultStatus: TaskStatus = TaskStatus.TODO;

  constructor(
    private taskService: TaskService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.updateColumns(tasks);
    });
  }

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    const task = event.item.data as Task;
    
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update task status based on the column
      const newStatus = this.getStatusFromColumn(event.container);
      if (newStatus && task.status !== newStatus) {
        this.taskService.updateTask(task.id, { status: newStatus });
        this.chatService.sendSystemMessage(
          `Task "${task.title}" moved to ${this.getStatusLabel(newStatus)}`,
          task.id
        );
      }
    }
  }

  openCreateForm() {
    this.editingTask = null;
    this.defaultStatus = TaskStatus.TODO;
    this.showTaskForm = true;
  }

  openCreateFormWithStatus(status: TaskStatus) {
    this.editingTask = null;
    this.defaultStatus = status;
    this.showTaskForm = true;
  }

  openEditForm(task: Task) {
    this.editingTask = task;
    this.showTaskForm = true;
  }

  closeTaskForm() {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  onTaskSubmit(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, taskData);
      this.chatService.sendSystemMessage(
        `Task "${taskData.title}" was updated`,
        this.editingTask.id
      );
    } else {
      const newTaskData = { ...taskData, status: this.defaultStatus };
      this.taskService.addTask(newTaskData);
      this.chatService.sendSystemMessage(
        `New task "${taskData.title}" was created`
      );
    }
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      const task = this.findTaskById(taskId);
      this.taskService.deleteTask(taskId);
      if (task) {
        this.chatService.sendSystemMessage(
          `Task "${task.title}" was deleted`
        );
      }
    }
  }

  getConnectedLists(): string[] {
    return this.columns.map((_, index) => index.toString());
  }

  private updateColumns(tasks: Task[]) {
    this.columns.forEach(column => {
      column.tasks = tasks.filter(task => task.status === column.status);
    });
  }

  private getStatusFromColumn(container: any): TaskStatus | null {
    const columnIndex = parseInt(container.id);
    return this.columns[columnIndex]?.status || null;
  }

  private getStatusLabel(status: TaskStatus): string {
    const labels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    return labels[status];
  }

  private findTaskById(taskId: string): Task | null {
    for (const column of this.columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
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

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }
}