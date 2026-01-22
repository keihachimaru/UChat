import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './schema/chat.schema';
import { Model, Types } from 'mongoose';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PinChatDto } from './dto/pin-chat.dto';

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
      .select('_id name messageIds documentIds pinned')
      .sort({ createdAt: -1 })
      .exec();    
  }

  async delete(author: string, id: string) {
    return this.chatModel.deleteOne({ author: author, _id: id })
  }

  async updateName(dto: UpdateChatDto) {
    return await this.chatModel.updateOne({
      author: dto.author, 
      _id: dto.id,
    }, { name: dto.name }).exec();
  }

  async pin(dto: PinChatDto) {
    const chat = await this.chatModel.findOne({
      author: dto.author, 
      _id: dto.id,
    }).exec();
    if(!chat) throw new BadRequestException('Chat not found');
    
    chat.pinned = !chat.pinned;
    return chat.save();
  }

  async addMessage(chatId: string, messageId: Types.ObjectId) {
    await this.chatModel.updateOne(
      { _id: chatId }, 
      { $push: { messageIds: messageId }}
    ).exec()
  }

}
