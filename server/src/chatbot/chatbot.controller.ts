import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('api/admin/chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('query')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('admin.view')
  async query(@Body() body: { question?: string; context?: string }) {
    const { question, context } = body;
    
    if (!question || typeof question !== 'string') {
      throw new BadRequestException('La question est requise');
    }

    const response = await this.chatbotService.query(question, context);
    
    if (response.error) {
      return {
        success: false,
        error: response.error,
        answer: response.answer
      };
    }
    
    return {
      success: true,
      answer: response.answer,
      sql: response.sql,
      data: response.data
    };
  }
}

