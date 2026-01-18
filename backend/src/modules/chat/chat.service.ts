import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>
  ) {}
  
  async create(createChatInput: CreateChatInput ) {
    return this.chatModel.create(createChatInput);
  }

  async findAll(author: string) {
    return this.chatModel
      .find({ author })
      .select('_id name')
      .sort({ createdAt: -1 })
      .exec();    
  }
}
