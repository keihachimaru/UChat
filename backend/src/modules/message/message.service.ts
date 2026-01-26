import { Injectable } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { create } from 'node:domain';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>
  ) {}
  async create(dto: CreateMessageInput) {
    return await this.messageModel.create(dto)
  }
  async getMessagesFromChat(user: string, chat: string) {
    return await this.messageModel.find({
      user: user,
      chat: chat,
    }).exec()
  }
  async deleteById(user: string, msg: string) {
    return await this.messageModel.deleteOne({ user: user, _id: msg })
  }
}
