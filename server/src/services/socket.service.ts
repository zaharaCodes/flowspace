import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../utils/prisma';

const onlineUsers = new Map<string, string>();

export const setupSocketHandlers = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.name} (${user.role})`);
    onlineUsers.set(user.id, socket.id);
    io.emit('online_users', onlineUsers.size);

    socket.on('get_online_count', () => {
      socket.emit('online_users', onlineUsers.size);
    });

    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave_project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(user.id);
      io.emit('online_users', onlineUsers.size);
      console.log(`User disconnected: ${user.name}`);
    });
  });
};

export const emitActivityToRoom = async (
  io: Server,
  projectId: string,
  activity: any,
  actorRole: string,
  actorId: string
) => {
  const sockets = await io.in(`project:${projectId}`).fetchSockets();
  for (const socket of sockets) {
    const socketUser = (socket as any).user;
    if (!socketUser) continue;
    if (socketUser.role === 'ADMIN') {
      socket.emit('new_activity', activity);
    } else if (socketUser.role === 'PROJECT_MANAGER') {
      const project = await prisma.project.findFirst({
        where: { id: projectId, managerId: socketUser.id },
      });
      if (project) socket.emit('new_activity', activity);
    } else if (socketUser.role === 'DEVELOPER') {
      if (activity.task?.assignedTo === socketUser.id) {
        socket.emit('new_activity', activity);
      }
    }
  }
};

export const emitNotification = (io: Server, userId: string, notification: any) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('new_notification', notification);
  }
};

export const getOnlineCount = () => onlineUsers.size;