import { Req, UseGuards, Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Req() req : Request & { user: { id : string }},
    @Body() createProfileDto: CreateProfileDto
  ) {
    const input = {
      user: req.user.id,
      ...createProfileDto
    }
    return this.profileService.create(input);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req : Request & { user: { id : string }}) {
    return await this.profileService.findAll(req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateOne(
    @Req() req : Request & { user: { id: string }},
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.profileService.updateById(id, req.user.id, dto);
    if (!updated) {
      throw new NotFoundException(`Profile ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @Req() req: Request & { user: { id: string }},
    @Param('id') id: string
  ) {
    const success = await this.profileService.removeById(id, req.user.id);
    return { success: !!success.deletedCount };
  }
}
