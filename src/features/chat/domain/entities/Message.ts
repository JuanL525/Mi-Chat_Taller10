export interface MessageAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: 'refugio' | 'adoptante' | string;
}

export interface Message {
  id: string;
  roomId: string;
  content: string;
  createdAt: string;
  author: MessageAuthor;
}