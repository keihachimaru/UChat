import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true })
    system: boolean;
    
    @Prop({ required: true })
    content: string;

    @Prop()
    aimodel: string;

    @Prop()
    author: string;

    @Prop({ ref: 'User', type: Types.ObjectId, required: true })
    user: string;

    @Prop({ ref: 'Chat', type: Types.ObjectId, required: true })
    chat: string;

    @Prop({ default: false })
    pinned: boolean;

    @Prop({ ref: 'Message', type: Types.ObjectId })
    reply: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);