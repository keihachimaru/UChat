import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongoDBProvider } from './database/mongodb';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule, AuthModule,
    MongoDBProvider
  ],
})

export class AppModule {}
