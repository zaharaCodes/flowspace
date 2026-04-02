import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { SkeletonStat, SkeletonActivity } from '../../components/ui/Skeleton';
import ActivityFeed from '../../components/ui/ActivityFeed';
import type { Project, Task } from '../../types';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects').then(async (pRes) => {
      const projs: Project[] = pRes.data.data;
      setProjects(projs);
      const taskArrays = await Promise.all(
        projs.map((p) => api.get(`/api/tasks/project/${p.id}`).then((r) => r.data.data))
      );
      setAllTasks(taskArrays.flat());
      setLoading(false);
    });
    const socket = getSocket();
    if (socket) {
      socket.on('online_users', (count: number) => setOnlineUsers(count));
      socket.emit('get_online_count');
    }
    return () => { socket?.off('online_users'); };
  }, []);

  const statusCounts = {
    TODO: allTasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    IN_REVIEW: allTasks.filter(t => t.status === 'IN_REVIEW').length,
    DONE: allTasks.filter(t => t.status === 'DONE').length,
    OVERDUE: allTasks.filter(t => t.status === 'OVERDUE').length,
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
      </div>
      <SkeletonActivity />
    </div>
  );

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Full overview of all projects and team activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Projects</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{projects.length}</p>
              <p className="text-xs text-blue-500 mt-1">Active projects</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Online</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{onlineUsers}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-500">Live right now</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Overdue</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{statusCounts.OVERDUE}</p>
              <p className="text-xs text-red-500 mt-1">Needs attention</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Tasks</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{allTasks.length}</p>
              <p className="text-xs text-purple-500 mt-1">{statusCounts.DONE} completed</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Task status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Tasks by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'To Do', count: statusCounts.TODO, bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-400' },
            { label: 'In Progress', count: statusCounts.IN_PROGRESS, bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
            { label: 'In Review', count: statusCounts.IN_REVIEW, bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
            { label: 'Done', count: statusCounts.DONE, bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
            { label: 'Overdue', count: statusCounts.OVERDUE, bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-xs font-medium mt-1 ${s.text} opacity-80`}>{s.label}</p>
              <div className="mt-2 h-1 bg-white bg-opacity-60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.bar}`}
                  style={{ width: allTasks.length ? `${(s.count / allTasks.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">All Projects</h2>
            <Link to="/projects" className="text-xs text-blue-600 hover:text-blue-800 font-medium">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm text-gray-400">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => {
                const projectTasks = allTasks.filter(t => t.projectId === project.id);
                const done = projectTasks.filter(t => t.status === 'DONE').length;
                const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                        {project.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.client?.company} · {project.manager?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:block w-20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{project._count?.tasks}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-900">Live Activity</h2>
          </div>
          <ActivityFeed global />
        </div>
      </div>
    </div>
  );
}