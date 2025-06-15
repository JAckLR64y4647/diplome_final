import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatState } from '../../models/chat.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>Team Chat</h2>
        <div class="online-users">
          <span class="online-indicator"></span>
          <span class="online-text">{{ currentUser?.firstName }} (You)</span>
        </div>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div 
          class="message" 
          *ngFor="let message of chatState.messages"
          [class.own-message]="message.senderId === currentUser?.id"
          [class.system-message]="message.type === 'system'"
        >
          <div class="message-avatar" *ngIf="message.type !== 'system' && message.senderId !== currentUser?.id">
            <img *ngIf="message.senderAvatar" [src]="message.senderAvatar" [alt]="message.senderName">
            <span *ngIf="!message.senderAvatar" class="avatar-placeholder">
              {{ getInitials(message.senderName) }}
            </span>
          </div>

          <div class="message-content">
            <div class="message-header" *ngIf="message.type !== 'system'">
              <span class="message-sender" *ngIf="message.senderId !== currentUser?.id">
                {{ message.senderName }}
              </span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>

            <div class="message-text" [class.system-text]="message.type === 'system'">
              {{ message.content }}
            </div>

            <div class="task-reference" *ngIf="message.taskId">
              <span class="task-icon">📋</span>
              <span class="task-text">Related to task</span>
            </div>
          </div>
        </div>

        <div class="empty-chat" *ngIf="chatState.messages.length === 0">
          <div class="empty-icon">💬</div>
          <h3>Start the conversation</h3>
          <p>Send your first message to begin collaborating with your team.</p>
        </div>
      </div>

      <div class="chat-input">
        <form (ngSubmit)="sendMessage()" class="message-form">
          <div class="input-container">
            <input
              type="text"
              [(ngModel)]="newMessage"
              name="message"
              placeholder="Type your message..."
              class="message-input"
              [disabled]="chatState.isLoading"
              maxlength="500"
            />
            <button 
              type="submit" 
              class="send-button"
              [disabled]="!newMessage.trim() || chatState.isLoading"
            >
              <span class="send-icon">📤</span>
            </button>
          </div>
          <div class="input-footer">
            <span class="char-count">{{ newMessage.length }}/500</span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--color-background);
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .chat-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .online-users {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .online-indicator {
      width: 8px;
      height: 8px;
      background: var(--color-success);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .online-text {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .chat-messages {
      flex: 1;
      padding: 1rem 2rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      display: flex;
      gap: 0.75rem;
      max-width: 70%;
      animation: slideUp 0.3s ease-out;
    }

    .message.own-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message.system-message {
      align-self: center;
      max-width: 90%;
      justify-content: center;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .message-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .message-sender {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--color-text);
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .message-text {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      line-height: 1.4;
      color: var(--color-text);
      word-wrap: break-word;
    }

    .own-message .message-text {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .system-text {
      background: var(--color-background);
      color: var(--color-text-secondary);
      text-align: center;
      font-style: italic;
      border-style: dashed;
    }

    .task-reference {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--color-background);
      border-radius: 6px;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .task-icon {
      font-size: 0.875rem;
    }

    .empty-chat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      flex: 1;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-chat h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .empty-chat p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .chat-input {
      padding: 1rem 2rem;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }

    .message-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-container {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .message-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 24px;
      font-size: 0.875rem;
      background: var(--color-background);
      color: var(--color-text);
      resize: none;
      transition: all 0.2s ease;
    }

    .message-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .send-button {
      width: 40px;
      height: 40px;
      background: var(--color-primary);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .send-button:hover:not(:disabled) {
      background: var(--color-secondary);
      transform: scale(1.05);
    }

    .send-button:disabled {
      background: var(--color-border);
      cursor: not-allowed;
      transform: none;
    }

    .send-icon {
      font-size: 0.875rem;
      color: white;
    }

    .input-footer {
      display: flex;
      justify-content: flex-end;
    }

    .char-count {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .chat-header {
        padding: 1rem;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }

      .chat-messages {
        padding: 1rem;
      }

      .chat-input {
        padding: 1rem;
      }

      .message {
        max-width: 85%;
      }
    }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatState: ChatState = {
    messages: [],
    isLoading: false,
    unreadCount: 0
  };

  newMessage = '';
  currentUser: User | null = null;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getAuthState().subscribe(state => {
      this.currentUser = state.user;
    });

    this.chatService.getChatState().subscribe(state => {
      const hadMessages = this.chatState.messages.length > 0;
      this.chatState = state;
      
      if (!hadMessages || state.messages.length > this.chatState.messages.length) {
        this.shouldScrollToBottom = true;
      }
    });

    this.chatService.markAsRead();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.chatState.isLoading) return;

    this.chatService.sendMessage(this.newMessage.trim());
    this.newMessage = '';
    this.shouldScrollToBottom = true;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  private scrollToBottom() {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}