import { Controller, Get, UseGuards, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { Message } from './schema/message.schema';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: Request & { user: { id: string }},
    @Body() dto: CreateMessageDto
  ) {
    const input = {
      system: dto.system,
      content: dto.content,
      aimodel: dto.model,
      author: dto.author,
      pinned: dto.pinned,
      user: req.user.id,
      chat: dto.chat,
      reply: dto.reply,
    }
    const message = await this.messageService.create(input);
    await this.chatService.addMessage(dto.chat, message._id);

    return {
      _id: message._id,
      reply: message.reply,
      system: message.system,
      author: message.author,
      content: message.content,
      pinned: message.pinned,
      timestamp: new Date(), 
    }
  }
}
