import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByFn"
        [@slideIn]="notification.state"
        class="max-w-md w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out"
        [ngClass]="{
          'bg-green-500': notification.type === 'success',
          'bg-red-500': notification.type === 'error', 
          'bg-amber-500': notification.type === 'warning',
          'bg-blue-500': notification.type === 'info'
        }">
        
        <!-- Icon -->
        <div class="flex-shrink-0 flex items-center justify-center w-12">
          <!-- Success Icon -->
          <svg *ngIf="notification.type === 'success'" 
               class="w-6 h-6 text-white" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M5 13l4 4L19 7"></path>
          </svg>
          
          <!-- Error Icon -->
          <svg *ngIf="notification.type === 'error'" 
               class="w-6 h-6 text-white" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          
          <!-- Warning Icon -->
          <svg *ngIf="notification.type === 'warning'" 
               class="w-6 h-6 text-white" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          
          <!-- Info Icon -->
          <svg *ngIf="notification.type === 'info'" 
               class="w-6 h-6 text-white" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <!-- Message Content -->
        <div class="flex-1 flex items-center px-4 py-3">
          <p class="text-sm font-medium text-white">
            {{ notification.message }}
          </p>
        </div>
        
        <!-- Close Button -->
        <div class="flex-shrink-0 flex items-center pr-3">
          <button 
            (click)="removeNotification(notification.id)"
            class="bg-transparent rounded-md p-1 text-white hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class CustomNotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }

  trackByFn(index: number, item: Notification) {
    return item.id;
  }
}
