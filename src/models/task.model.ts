export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  search?: string;
  sortBy?: 'title' | 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}