import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../core/services/notificacion/notificacion-type.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notificacion',
  imports: [
    CommonModule
  ],
  templateUrl: './notificacion.component.html',
  styleUrl: './notificacion.component.css'
})
export class NotificacionComponent implements OnInit {

  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notification => {
      this.notifications.push(notification);

      setTimeout(() => {
        this.remove(notification.id);
      }, 3000);
    });
  }

  remove(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
