import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { Chat, ChatSchema } from '../chat/schema/chat.schema';
import { ChatService } from '../chat/chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
    ])
  ],
  controllers: [MessageController],
  providers: [MessageService, ChatService],
})
export class MessageModule {}
