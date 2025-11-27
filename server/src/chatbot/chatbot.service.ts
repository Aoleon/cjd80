import { Injectable } from '@nestjs/common';
import { getChatbotService as getChatbotServiceInstance } from '../../services/chatbot-service';

@Injectable()
export class ChatbotService {
  async query(question: string, context?: string) {
    const chatbotService = getChatbotServiceInstance();
    return await chatbotService.query({ question, context });
  }
}


