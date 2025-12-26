import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject = new Subject<Notification>();
  notifications$ = this.notificationsSubject.asObservable();

  private counter = 0;

  
show(message: string, type: NotificationType = 'info', title?: string) {
  this.notificationsSubject.next({
    id: ++this.counter,
    message,
    type,
    title: title || this.getDefaultTitle(type)
  });
}

private getDefaultTitle(type: NotificationType): string {
  switch (type) {
    case 'success': return 'Éxito';
    case 'error': return 'Error';
    case 'warning': return 'Advertencia';
    case 'info': return 'Información';
    default: return '';
  }
}

  success(message: string, title?: string) {
  this.show(message, 'success', title);
}

  error(message: string, title?: string) {
    this.show(message, 'error', title);

  }

  info(message: string, title?: string) {
    this.show(message, 'info', title);
  }

  warning(message: string, title?: string) {
    this.show(message, 'warning', title);
  }
}
