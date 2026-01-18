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
  create(dto: CreateMessageInput) {
    return this.messageModel.create(dto)
  }
}
