export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: MessageType;
  taskId?: string;
  attachments?: MessageAttachment[];
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  TASK_UPDATE = 'task_update'
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  unreadCount: number;
}