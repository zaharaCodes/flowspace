import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import ActivityFeed from '../../components/ui/ActivityFeed';
import type { Task, TaskStatus } from '../../types';
import { formatDate } from '../../components/ui/timeUtils';
import { useAuth } from '../../contexts/AuthContext';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE'];

export default function DeveloperDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/projects').then(async (res) => {
      const projects = res.data.data;
      const allTasks: Task[] = [];
      for (const p of projects) {
        const tRes = await api.get(`/api/tasks/project/${p.id}`);
        allTasks.push(...tRes.data.data);
      }
      setTasks(allTasks);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    setUpdating(taskId);
    try {
      await api.put(`/api/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    } finally {
      setUpdating(null);
    }
  };

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const overdueCount = tasks.filter((t) => t.status === 'OVERDUE').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">Tasks assigned to you, sorted by priority</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="To Do" value={todoCount} color="blue" />
        <StatsCard title="In Progress" value={inProgressCount} color="orange" />
        <StatsCard title="Overdue" value={overdueCount} color="red" />
        <StatsCard title="Done" value={doneCount} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-gray-900">All Tasks</h2>
          {sortedTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8 bg-white rounded-xl border border-gray-200">
              No tasks assigned yet
            </p>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-gray-400">Due {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <select
                    value={task.status}
                    disabled={updating === task.id}
                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 bg-white"
                  >
                    {STATUSES.filter((s) => s !== 'OVERDUE').map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">My Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}