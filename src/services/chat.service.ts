import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, ChatState, MessageType } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatState = new BehaviorSubject<ChatState>({
    messages: [],
    isLoading: false,
    unreadCount: 0
  });

  private readonly STORAGE_KEY = 'task-management-chat';

  constructor(private authService: AuthService) {
    this.loadMessages();
  }

  getChatState(): Observable<ChatState> {
    return this.chatState.asObservable();
  }

  sendMessage(content: string, taskId?: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const message: ChatMessage = {
      id: this.generateId(),
      content: content.trim(),
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: MessageType.TEXT,
      taskId
    };

    const currentState = this.chatState.value;
    const updatedMessages = [...currentState.messages, message];
    
    this.chatState.next({
      ...currentState,
      messages: updatedMessages
    });

    this.saveMessages();
  }

  sendSystemMessage(content: string, taskId?: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      content,
      senderId: 'system',
      senderName: 'System',
      timestamp: new Date(),
      type: MessageType.SYSTEM,
      taskId
    };

    const currentState = this.chatState.value;
    const updatedMessages = [...currentState.messages, message];
    
    this.chatState.next({
      ...currentState,
      messages: updatedMessages
    });

    this.saveMessages();
  }

  markAsRead(): void {
    const currentState = this.chatState.value;
    this.chatState.next({
      ...currentState,
      unreadCount: 0
    });
  }

  private loadMessages(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        this.chatState.next({
          messages,
          isLoading: false,
          unreadCount: 0
        });
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }

  private saveMessages(): void {
    try {
      const messages = this.chatState.value.messages;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}