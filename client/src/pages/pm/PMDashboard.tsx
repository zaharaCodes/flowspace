import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ActivityFeed from '../../components/ui/ActivityFeed';
import { PriorityBadge } from '../../components/ui/StatusBadge';
import DueDateBadge from '../../components/ui/DueDateBadge';
import TaskModal from '../../components/ui/TaskModal';
import type { Project, Task, TaskStatus } from '../../types';

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { status: 'DONE', label: 'Done', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
];

export default function PMDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  useEffect(() => {
    api.get('/api/projects').then(async (res) => {
      const projs: Project[] = res.data.data;
      setProjects(projs);
      const taskArrays = await Promise.all(
        projs.map((p) => api.get(`/api/tasks/project/${p.id}`).then((r) => r.data.data))
      );
      setAllTasks(taskArrays.flat());
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 86400000);
  const upcomingTasks = allTasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= now && due <= weekFromNow && t.status !== 'DONE';
  });

  const filteredTasks = selectedProject === 'ALL'
    ? allTasks
    : allTasks.filter(t => t.projectId === selectedProject);

  const overdueCount = allTasks.filter(t => t.status === 'OVERDUE').length;
  const doneCount = allTasks.filter(t => t.status === 'DONE').length;
  const criticalCount = allTasks.filter(t => t.priority === 'CRITICAL').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Manager Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your projects and team overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Projects', value: projects.length, color: 'blue', icon: '📁' },
          { label: 'Total Tasks', value: allTasks.length, color: 'purple', icon: '📋' },
          { label: 'Overdue', value: overdueCount, color: 'red', icon: '⚠️' },
          { label: 'Completed', value: doneCount, color: 'green', icon: '✅' },
        ].map((s) => (
          <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-semibold text-${s.color}-600 uppercase tracking-wider`}>{s.label}</p>
                <p className={`text-3xl font-bold text-${s.color}-700 mt-1`}>{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Projects */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">My Projects</h2>
              <Link to="/projects" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">View all →</Link>
            </div>
            <div className="space-y-2">
              {projects.map((project) => {
                const pt = allTasks.filter(t => t.projectId === project.id);
                const done = pt.filter(t => t.status === 'DONE').length;
                const progress = pt.length ? Math.round((done / pt.length) * 100) : 0;
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {project.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.client?.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block w-24">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{pt.length}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Kanban / List view toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-bold text-gray-900">Tasks</h2>
              <div className="flex items-center gap-2">
                {/* Project filter */}
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Projects</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {/* View toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('list')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setView('kanban')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  >
                    Kanban
                  </button>
                </div>
              </div>
            </div>

            {view === 'list' ? (
              <div className="space-y-2">
                {filteredTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <PriorityBadge priority={task.priority} />
                        <DueDateBadge dueDate={task.dueDate} status={task.status} />
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No tasks found</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto">
                {COLUMNS.map((col) => {
                  const colTasks = filteredTasks.filter(t => t.status === col.status);
                  return (
                    <div key={col.status} className={`rounded-xl border p-3 min-w-0 ${col.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</p>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${col.color} bg-white bg-opacity-60`}>{colTasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colTasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTaskId(task.id)}
                            className="bg-white rounded-lg p-2.5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1.5">{task.title}</p>
                            <div className="flex items-center justify-between">
                              <PriorityBadge priority={task.priority} />
                              {task.developer && (
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                  {task.developer?.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <p className="text-xs text-center text-gray-400 py-3">Empty</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming due this week */}
          {upcomingTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Due this week ({upcomingTasks.length})</h2>
              <div className="space-y-2">
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    <DueDateBadge dueDate={task.dueDate} status={task.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-900">Live Activity</h2>
          </div>
          <ActivityFeed />
        </div>
      </div>

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={(taskId, status) => {
            setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
          }}
        />
      )}
    </div>
  );
}