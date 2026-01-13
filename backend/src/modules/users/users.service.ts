import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}
  async findOrCreate(googleUser: CreateUserDto) {
    return this.userModel.findOneAndUpdate(
      { provider: googleUser.provider, providerId: googleUser.providerId },
      { $setOnInsert: googleUser },
      { new: true, upsert: true }
    )
  }
  
  async create(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOne({
      provider: createUserDto.provider,
      providerId: createUserDto.providerId,
    })
    if(existing) throw new BadRequestException('User already exists.');

    return this.userModel.create(createUserDto);
  }

  async find(id: string) {
    const existing = await this.userModel.findOne({
      provider: 'google',
      providerId: id,
    })
    if(!existing) throw new BadRequestException('User doesnt exist.');
    
    return existing;
  }
}
