import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
    @Prop({ required: true })
    name: string;
    
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    author: string;

    @Prop({ type: [Types.ObjectId], ref: 'Message', default: [] })
    messageIds: string[];

    @Prop({ type: [Types.ObjectId], ref: 'Document', default: [] })
    documentIds: string[];
    
    @Prop({ default: false })
    pinned: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);