import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiChatRepository } from '../../domain/repositories/IAiChatRepository';
import { AiMessage, SendAiMessageDTO, createAiMessage } from '../../domain/entities/AiMessage';
import { AppError } from '@shared/domain/errors/AppError';

const SYSTEM_INSTRUCTION = `Eres PetAdopt AI, un asistente virtual especializado en salud, cuidados y bienestar de mascotas. 
Ayudas a adoptantes y refugios con preguntas sobre:
- Salud y alimentación de perros, gatos y otros animales
- Cuidados básicos y veterinarios
- Proceso de adopción responsable
- Comportamiento animal y entrenamiento
Responde siempre en español, de forma amigable, empática y profesional. 
Si una pregunta está fuera de tu especialidad (mascotas/animales), redirige gentilmente al tema.`;

export class GeminiChatRepository implements IAiChatRepository {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendMessage(dto: SendAiMessageDTO): Promise<AiMessage> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const history = dto.history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(dto.prompt);
      const text = result.response.text();

      return createAiMessage('model', text);
    } catch (e: any) {
      throw new AppError('AI_CHAT_FAILED', e.message ?? 'Error al conectar con la IA');
    }
  }
}
