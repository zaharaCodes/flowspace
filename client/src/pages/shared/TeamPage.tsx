import { useEffect, useState } from 'react';
import api from '../../services/api';

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  PROJECT_MANAGER: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  DEVELOPER: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
};

const roleLabel: Record<string, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  DEVELOPER: 'Developer',
};

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([
      api.get('/api/users'),
      api.get('/api/projects'),
    ]).then(async ([uRes, pRes]) => {
      setUsers(uRes.data.data);
      setProjects(pRes.data.data);
      const taskArrays = await Promise.all(
        pRes.data.data.map((p: any) =>
          api.get(`/api/tasks/project/${p.id}`).then((r) => r.data.data)
        )
      );
      setTasks(taskArrays.flat());
      setLoading(false);
    });
  }, []);

  const getTasksForUser = (userId: string) =>
    tasks.filter((t) => t.assignedTo === userId);

  const getCompletedForUser = (userId: string) =>
    tasks.filter((t) => t.assignedTo === userId && t.status === 'DONE').length;

  const getOverdueForUser = (userId: string) =>
    tasks.filter((t) => t.assignedTo === userId && t.status === 'OVERDUE').length;

  const filteredUsers = filter === 'ALL' ? users : users.filter(u => u.role === filter);

  const roleCounts = {
    ALL: users.length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
    PROJECT_MANAGER: users.filter(u => u.role === 'PROJECT_MANAGER').length,
    DEVELOPER: users.filter(u => u.role === 'DEVELOPER').length,
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(j => <div key={j} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} members across all roles</p>
      </div>

      {/* Role filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'ADMIN', label: 'Admins' },
          { key: 'PROJECT_MANAGER', label: 'Project Managers' },
          { key: 'DEVELOPER', label: 'Developers' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              filter === tab.key ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {roleCounts[tab.key as keyof typeof roleCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((member, idx) => {
          const memberTasks = getTasksForUser(member.id);
          const completed = getCompletedForUser(member.id);
          const overdue = getOverdueForUser(member.id);
          const inProgress = memberTasks.filter(t => t.status === 'IN_PROGRESS').length;
          const progress = memberTasks.length ? Math.round((completed / memberTasks.length) * 100) : 0;
          const rc = roleColors[member.role];

          return (
            <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{member.name}</p>
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-md font-semibold mt-1 border ${rc.bg} ${rc.text} ${rc.border}`}>
                    {roleLabel[member.role]}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-700">{memberTasks.length}</p>
                  <p className="text-xs text-blue-500 font-medium">Tasks</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-green-700">{completed}</p>
                  <p className="text-xs text-green-500 font-medium">Done</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${overdue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className={`text-lg font-bold ${overdue > 0 ? 'text-red-700' : 'text-gray-400'}`}>{overdue}</p>
                  <p className={`text-xs font-medium ${overdue > 0 ? 'text-red-500' : 'text-gray-400'}`}>Overdue</p>
                </div>
              </div>

              {/* Progress bar */}
              {memberTasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 font-medium">Completion</span>
                    <span className="text-xs font-bold text-gray-700">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* In progress indicator */}
              {inProgress > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-600 font-medium">{inProgress} task{inProgress > 1 ? 's' : ''} in progress</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}