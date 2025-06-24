import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3003');
  }

  join(userId: string): void {
    this.socket.emit('join', userId);
  }

  onNewComment(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('newComment', () => observer.next());
    });
  }
}