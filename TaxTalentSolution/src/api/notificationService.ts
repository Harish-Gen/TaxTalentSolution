import { apiRequest } from './apiService';
import type { Notification } from '../database/types';

export interface BackendNotification {
  id: string;
  userid: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isread?: boolean;
  createdon?: string;
}

function mapToFrontend(backend: BackendNotification): Notification {
  return {
    id: backend.id,
    user_id: backend.userid,
    type: backend.type,
    title: backend.title,
    message: backend.message || '',
    link: backend.link,
    is_read: backend.isread === true,
    created_at: backend.createdon || new Date().toISOString(),
  };
}

export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const data = await apiRequest<BackendNotification[]>(`/api/notifications/user/${userId}`);
    return data.map(mapToFrontend);
  },

  async upsert(notification: {
    id?: string;
    userid: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
    isread?: boolean;
  }): Promise<Notification> {
    const data = await apiRequest<BackendNotification>('/api/notifications/', 'POST', notification);
    return mapToFrontend(data);
  },

  async markRead(userId: string, notificationId: string): Promise<Notification> {
    return this.upsert({ id: notificationId, userid: userId, type: 'system', title: '', isread: true });
  },
};
