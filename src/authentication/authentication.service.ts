import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class AuthenticationService {
  constructor(private prismaService: PrismaService) {}

  async signup(dto: UserDto): Promise<User> {
    try {
      const user = await this.prismaService.user.create({
        data: { ...dto },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signin(dto: UserDto): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { username: dto.username },
      });
      if (!user) {
        throw new NotFoundException();
      }
      if (user.password !== dto.password) {
        throw new ForbiddenException();
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
