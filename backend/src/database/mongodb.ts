import { MongooseModule } from '@nestjs/mongoose';

export const MongoDBProvider = MongooseModule.forRoot(
    process.env.MONGO_URI || 'mongodb://localhost:27017/uchat'
)