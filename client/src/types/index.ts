export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'OVERDUE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  managerId: string;
  client: Client;
  manager: { id: string; name: string; email: string };
  _count?: { tasks: number };
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  projectId: string;
  assignedTo: string;
  project?: Project;
  developer?: { id: string; name: string; email: string };
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt: string;
  user: { id: string; name: string };
  task?: { id: string; title: string; assignedTo: string };
  project?: { id: string; name: string };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}