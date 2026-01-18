import { 
  Controller, Get, UseGuards, Post, 
  Body, Patch, Param, Delete, Req 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: Request & { user : { id: string }},
    @Body() dto: CreateChatDto, 
  ) {
    const chat = await this.chatService.create({ 
      author: req.user.id, 
      name: dto.name 
    });

    return {
      id: chat.id,
      name: chat.name,  
    }
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAll(
    @Req() req: Request & { user: { id: string }}
  ) {
    const chats = await this.chatService.findAll(req.user.id);
    
    return chats;
  }
}
