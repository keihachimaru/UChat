import { Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model } from 'mongoose';
import { UpdateChatDto } from './dto/update-chat.dto';

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

  async delete(author: string, id: string) {
    return this.chatModel.deleteOne({ author: author, _id: id })
  }

  async updateName(dto: UpdateChatDto) {
    return this.chatModel.updateOne({
      author: dto.author, 
      _id: dto.id,
    }, { name: dto.name }).exec();
  }
}
