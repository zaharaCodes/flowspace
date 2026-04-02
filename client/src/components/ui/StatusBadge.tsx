import type { TaskStatus, Priority } from '../../types';

const statusStyles: Record<TaskStatus, string> = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  OVERDUE: 'Overdue',
};

const statusDots: Record<TaskStatus, string> = {
  TODO: 'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-yellow-500',
  DONE: 'bg-green-500',
  OVERDUE: 'bg-red-500',
};

const priorityStyles: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-700',
};

const priorityDots: Record<Priority, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusStyles[status]}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
    {statusLabels[status]}
  </span>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${priorityStyles[priority]}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[priority]}`} />
    {priority}
  </span>
);