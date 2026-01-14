import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, default: "google" })
    provider: string;
    
    @Prop({ required: true })
    providerId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);