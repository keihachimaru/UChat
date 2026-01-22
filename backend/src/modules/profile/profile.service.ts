import { Injectable } from '@nestjs/common';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { Profile } from './schema/profile.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose'

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>
  ) {}
  async create(createProfileInput: CreateProfileInput) {
    return await this.profileModel.create(createProfileInput);
  }

  async findAll(id: string) {
    return await this.profileModel
    .find({ user: id })
    .sort({ createdAt: 1 })
    .exec();
  }

  async removeById(id: string, uid: string) {
    return await this.profileModel.deleteOne({ user: uid, _id: id })
  }

  async updateById(id: string, user: string, input: UpdateProfileInput) {
    return await this.profileModel.findOneAndUpdate(
      { user: user, _id: new Types.ObjectId(id), }, 
      { $set: { ...input }}, 
      { new: true }
    ).exec();
  }
}
