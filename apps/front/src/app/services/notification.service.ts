import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  state?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  private addNotification(message: string, type: NotificationType, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration,
      state: 'in'
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto-remove após a duração especificada
    setTimeout(() => {
      this.remove(notification.id);
    }, duration);
  }

  showSuccess(message: string, duration: number = 3000) {
    this.addNotification(message, 'success', duration);
  }

  showError(message: string, duration: number = 5000) {
    this.addNotification(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 4000) {
    this.addNotification(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 3000) {
    this.addNotification(message, 'info', duration);
  }

  remove(id: string) {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(updatedNotifications);
  }

  clear() {
    this.notifications.next([]);
  }
}