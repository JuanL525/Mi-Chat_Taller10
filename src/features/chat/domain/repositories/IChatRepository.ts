import { Message, Room } from "../entities/Message";

export interface IChatRepository {
  getRooms(): Promise<Room[]>;

  createRoom(name: string, userId: string): Promise<Room>;

  getMessages(roomId: string): Promise<Message[]>;

  sendMessage(
    roomId: string,
    userId: string,
    content: string,
  ): Promise<Message>;

  // Devuelve la funcion unsubscribe, compatible con el return de useEffect
  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void;
}