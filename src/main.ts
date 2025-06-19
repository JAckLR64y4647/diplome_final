import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

// Services
import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';
import { ChatService } from './services/chat.service';
import { ThemeService } from './services/theme.service';

// Models
import { User, AuthState } from './models/user.model';
import { Task, TaskFilter, TaskStatus } from './models/task.model';
import { ChatState } from './models/chat.model';

// Components
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KanbanBoardComponent } from './components/kanban/kanban-board.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { ChatComponent } from './components/chat/chat.component';
import { UserProfileComponent } from './components/users/user-profile.component';
import { UsersListComponent } from './components/users/users-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    RegisterComponent,
    SidebarComponent,
    DashboardComponent,
    KanbanBoardComponent,
    TaskFormComponent,
    TaskItemComponent,
    TaskFiltersComponent,
    ChatComponent,
    UserProfileComponent,
    UsersListComponent
  ],
  template: `
    <!-- Authentication Views -->
    <div *ngIf="!authState.isAuthenticated" class="auth-wrapper">
      <app-login 
        *ngIf="authMode === 'login'"
        (switchMode)="authMode = $event"
      ></app-login>
      
      <app-register 
        *ngIf="authMode === 'register'"
        (switchMode)="authMode = $event"
      ></app-register>
    </div>

    <!-- Main Application -->
    <div *ngIf="authState.isAuthenticated" class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar
        [currentView]="currentView"
        [unreadCount]="chatState.unreadCount"
        (viewChange)="navigateToView($event)"
        (sidebarToggle)="onSidebarToggle($event)"
      ></app-sidebar>

      <main class="main-content">
        <app-dashboard *ngIf="currentView === 'dashboard'"></app-dashboard>
        <app-kanban-board *ngIf="currentView === 'kanban'"></app-kanban-board>

        <div *ngIf="currentView === 'tasks'" class="tasks-view">
          <div class="tasks-header">
            <div class="header-content">
              <h1>Tasks</h1>
              <p>Manage and organize your tasks</p>
            </div>
            <button class="btn btn-primary" (click)="openCreateForm()">➕ New Task</button>
          </div>

          <app-task-filters (filtersChange)="onFiltersChange($event)"></app-task-filters>

          <div class="tasks-section">
            <div class="tasks-list-header">
              <h2>{{ getTasksTitle() }}</h2>
              <div class="tasks-count">{{ filteredTasks.length }} tasks</div>
            </div>

            <div class="tasks-grid" *ngIf="filteredTasks.length > 0; else noTasks">
              <app-task-item
                *ngFor="let task of filteredTasks; trackBy: trackByTaskId"
                [task]="task"
                (editTask)="openEditForm($event)"
                (deleteTask)="deleteTask($event)"
                (updateTaskStatus)="updateTaskStatus($event)"
              ></app-task-item>
            </div>

            <ng-template #noTasks>
              <div class="no-tasks">
                <div class="no-tasks-icon">📝</div>
                <h3>{{ getNoTasksMessage() }}</h3>
                <p>{{ getNoTasksDescription() }}</p>
                <button class="btn btn-primary" (click)="openCreateForm()">Create your first task</button>
              </div>
            </ng-template>
          </div>

          <app-task-form
            [isVisible]="showTaskForm"
            [editingTask]="editingTask"
            (taskSubmit)="onTaskSubmit($event)"
            (formClose)="closeTaskForm()"
          ></app-task-form>
        </div>

        <app-chat *ngIf="currentView === 'chat'"></app-chat>
        <app-users-list *ngIf="currentView === 'users'"></app-users-list>
        <app-user-profile *ngIf="currentView === 'profile'"></app-user-profile>
      </main>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .app-layout {
      display: flex;
      height: 100vh;
      background: var(--color-background);
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      overflow-y: auto;
      transition: margin-left 0.3s ease;
    }

    .app-layout.sidebar-collapsed .main-content {
      margin-left: 80px;
    }

    .tasks-view {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--color-background);
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 2rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .header-content h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
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
      background: var(--color-secondary);
      transform: translateY(-1px);
    }

    .tasks-section {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .tasks-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .tasks-count {
      background: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .no-tasks {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-tasks-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }

      .app-layout.sidebar-collapsed .main-content {
        margin-left: 0;
      }

      .tasks-header {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .tasks-section {
        padding: 1rem;
      }

      .tasks-grid {
        grid-template-columns: 1fr;
      }

      .tasks-list-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        text-align: center;
      }
    }
  `]
})
export class App implements OnInit {
  authState: AuthState = { user: null, isAuthenticated: false, isLoading: false };
  authMode: 'login' | 'register' = 'login';
  currentView = 'dashboard';
  sidebarCollapsed = false;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  showTaskForm = false;
  editingTask: Task | null = null;
  currentFilters: TaskFilter = { sortBy: 'createdAt', sortOrder: 'desc' };

  chatState: ChatState = { messages: [], isLoading: false, unreadCount: 0 };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private chatService: ChatService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.getCurrentTheme().subscribe();
    this.authService.getAuthState().subscribe(state => (this.authState = state));
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilters();
    });
    this.chatService.getChatState().subscribe(state => (this.chatState = state));
  }

  navigateToView(view: string) {
    this.currentView = view;
    if (view === 'chat') this.chatService.markAsRead();
  }

  onSidebarToggle(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  openCreateForm() {
    this.editingTask = null;
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
      this.taskService.addTask(taskData);
      this.chatService.sendSystemMessage(
        `New task "${taskData.title}" was created`
      );
    }
  }

  deleteTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    this.taskService.deleteTask(taskId);
    if (task) {
      this.chatService.sendSystemMessage(`Task "${task.title}" was deleted`);
    }
  }

  updateTaskStatus(event: { id: string; status: TaskStatus }) {
    const task = this.tasks.find(t => t.id === event.id);
    this.taskService.updateTask(event.id, { status: event.status });
    if (task) {
      this.chatService.sendSystemMessage(
        `Task "${task.title}" status changed to ${this.getStatusLabel(event.status)}`,
        event.id
      );
    }
  }

  onFiltersChange(filters: TaskFilter) {
    this.currentFilters = filters;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTasks = this.taskService.getFilteredTasks(this.currentFilters);
  }

  getTasksTitle(): string {
    if (this.currentFilters.search) return `Search Results for "${this.currentFilters.search}"`;
    if (this.currentFilters.status) {
      const statusLabels: Record<TaskStatus, string> = {
        'todo': 'To Do Tasks',
        'in-progress': 'In Progress Tasks',
        'completed': 'Completed Tasks'
      };
      return statusLabels[this.currentFilters.status];
    }
    return 'All Tasks';
  }

  getNoTasksMessage(): string {
    const hasFilters = this.currentFilters.search || this.currentFilters.status || this.currentFilters.priority || this.currentFilters.category;
    return hasFilters ? 'No tasks match your filters' : this.tasks.length === 0 ? 'No tasks yet' : 'No tasks found';
  }

  getNoTasksDescription(): string {
    const hasFilters = this.currentFilters.search || this.currentFilters.status || this.currentFilters.priority || this.currentFilters.category;
    return hasFilters
      ? 'Try adjusting your filters to see more results.'
      : this.tasks.length === 0
        ? 'Create your first task to get started with managing your workflow.'
        : 'Try adjusting your search criteria.';
  }

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Completed'
    };
    return labels[status];
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}

bootstrapApplication(App);
