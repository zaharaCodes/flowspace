import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Task, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import DueDateBadge from './DueDateBadge';
import { formatDistanceToNow, formatDate } from './timeUtils';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function TaskModal({ taskId, onClose, onStatusChange }: TaskModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/api/tasks/${taskId}`).then((r) => {
      setTask(r.data.data);
      setLoading(false);
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [taskId]);

  const updateStatus = async (status: TaskStatus) => {
    setUpdating(true);
    try {
      await api.put(`/api/tasks/${taskId}`, { status });
      setTask((prev: any) => ({ ...prev, status }));
      onStatusChange?.(taskId, status);
    } finally {
      setUpdating(false);
    }
  };

  const canEdit = user?.role !== 'DEVELOPER' || task?.assignedTo === user?.id;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 min-w-0 pr-4">
            {loading ? (
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            ) : (
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{task?.title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <DueDateBadge dueDate={task.dueDate} status={task.status} />
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">{task.description}</p>
                </div>
              )}

              {/* Assigned to */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned to</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {task.developer?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{task.developer?.name}</span>
                </div>
              </div>

              {/* Update status */}
              {canEdit && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={updating || task.status === s}
                        onClick={() => updateStatus(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          task.status === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        } disabled:opacity-50`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity log */}
              {task.activityLogs?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity Log</p>
                  <div className="space-y-3">
                    {task.activityLogs.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                          {log.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700">
                            <span className="font-semibold">{log.user?.name}</span>
                            {log.fromStatus && log.toStatus
                              ? ` moved from ${log.fromStatus.replace('_', ' ')} → ${log.toStatus.replace('_', ' ')}`
                              : ` ${log.action}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}