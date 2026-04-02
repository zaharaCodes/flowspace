import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { Project, Task, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import ActivityFeed from '../../components/ui/ActivityFeed';
import DueDateBadge from '../../components/ui/DueDateBadge';
import TaskModal from '../../components/ui/TaskModal';
import SearchBar from '../../components/ui/SearchBar';
import ProgressRing from '../../components/ui/ProgressRing';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTask } from '../../components/ui/Skeleton';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE'];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    dueDate: '', assignedTo: '', projectId: id || '',
  });

  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';
  const dueDateFrom = searchParams.get('dueDateFrom') || '';
  const dueDateTo = searchParams.get('dueDateTo') || '';

  const fetchTasks = () =>
    api.get(`/api/tasks/project/${id}`).then((r) => setTasks(r.data.data));

  useEffect(() => {
    Promise.all([
      api.get(`/api/projects/${id}`),
      api.get(`/api/tasks/project/${id}`),
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data.data);
      setTasks(tRes.data.data);
      setLoading(false);
    });
    if (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') {
      api.get('/api/users').then((r) =>
        setDevelopers(r.data.data.filter((u: any) => u.role === 'DEVELOPER'))
      ).catch(() => {});
    }
  }, [id]);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    setUpdating(taskId);
    try {
      await api.put(`/api/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status } : t));
    } finally {
      setUpdating(null);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/tasks', { ...form, projectId: id });
      await fetchTasks();
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '', projectId: id || '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (dueDateFrom && new Date(t.dueDate) < new Date(dueDateFrom)) return false;
    if (dueDateTo && new Date(t.dueDate) > new Date(dueDateTo)) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => <SkeletonTask key={i} />)}
      </div>
    </div>
  );

  if (!project) return <p className="text-gray-500">Project not found</p>;

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ProgressRing progress={progress} size={56} strokeWidth={5} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {project.client?.company} · PM: {project.manager?.name}
            </p>
            {project.description && (
              <p className="text-gray-600 text-sm mt-1.5 max-w-xl">{project.description}</p>
            )}
          </div>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Search + filters */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
            />
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setFilter('status', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setFilter('priority', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="">All Priorities</option>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="date"
                value={dueDateFrom}
                onChange={(e) => setFilter('dueDateFrom', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              />
              <input
                type="date"
                value={dueDateTo}
                onChange={(e) => setFilter('dueDateTo', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              />
              {(statusFilter || priorityFilter || dueDateFrom || dueDateTo || searchQuery) && (
                <button
                  onClick={() => { setSearchParams({}); setSearchQuery(''); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              )}
              <span className="text-sm text-gray-400 ml-auto">{filteredTasks.length} tasks</span>
            </div>
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-sm font-medium">No tasks match your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{task.title}</p>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <DueDateBadge dueDate={task.dueDate} status={task.status} />
                        {task.developer && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {task.developer.name.charAt(0)}
                            </div>
                            {task.developer.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {(user?.role !== 'DEVELOPER' || task.assignedTo === user?.id) && (
                        <select
                          value={task.status}
                          disabled={updating === task.id}
                          onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                        >
                          {STATUSES.filter(s => s !== 'OVERDUE').map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-900">Project Activity</h2>
          </div>
          <ActivityFeed projectId={id} />
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={(taskId, status) => {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
          }}
        />
      )}

      {/* Create task modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create Task</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign To</label>
                <select
                  required
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select developer</option>
                  {developers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}