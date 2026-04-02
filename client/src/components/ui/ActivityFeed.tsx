import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import type { ActivityLog } from '../../types';
import { formatDistanceToNow } from './timeUtils';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  projectId?: string;
  global?: boolean;
}

const formatAction = (activity: ActivityLog): string => {
  if (activity.fromStatus && activity.toStatus) {
    const from = activity.fromStatus.replace('_', ' ');
    const to = activity.toStatus.replace('_', ' ');
    const taskTitle = activity.task?.title || 'a task';
    return `${activity.user?.name} moved ${taskTitle} from ${from} → ${to}`;
  }
  return activity.action;
};

export default function ActivityFeed({ projectId, global: isGlobal }: Props) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const url = isGlobal
        ? '/api/activity/global'
        : projectId
        ? `/api/activity/project/${projectId}`
        : '/api/activity/missed';
      const res = await api.get(url);
      setActivities(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    const socket = getSocket();
    if (!socket) return;

    if (projectId) socket.emit('join_project', projectId);

    const lastSeen = localStorage.getItem('lastSeen');
    if (lastSeen) {
      api.get(`/api/activity/missed?since=${lastSeen}`).then((res) => {
        if (res.data.data.length > 0) {
          setActivities((prev) => {
            const ids = new Set(prev.map((a) => a.id));
            const newOnes = res.data.data.filter((a: ActivityLog) => !ids.has(a.id));
            return [...newOnes, ...prev];
          });
        }
      });
    }

    socket.on('new_activity', (activity: ActivityLog) => {
      setActivities((prev) => [activity, ...prev.slice(0, 49)]);
    });

    localStorage.setItem('lastSeen', new Date().toISOString());

    return () => {
      socket.off('new_activity');
      if (projectId) socket.emit('leave_project', projectId);
    };
  }, [projectId, isGlobal]);

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (activities.length === 0) return (
    <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
  );

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs flex-shrink-0">
            {activity.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">{formatAction(activity)}</p>
            {activity.project && isGlobal && (
              <p className="text-xs text-primary-600 mt-0.5">{activity.project.name}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}