import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    color: string;

    @Prop({ required: true, default: 1 })
    temperature: number;

    @Prop({ required: true, default: true })
    stream: boolean;

    @Prop({ required: true, default: 100 })
    maxTokens: number;

    @Prop({ required: true, default: true })
    autoReply: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);