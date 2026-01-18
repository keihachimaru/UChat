import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongoDBProvider } from './database/mongodb';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule, AuthModule,
    MongoDBProvider,
    DocumentModule,
    ChatModule,
    MessageModule,
    ProfileModule
  ],
})

export class AppModule {}
