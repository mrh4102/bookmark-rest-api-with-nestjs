import * as argon2 from 'argon2';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

import { PrismaService } from '../prisma/prisma.service';
import { TokenDto, UserDto } from './dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: UserDto): Promise<TokenDto> {
    try {
      const hash = await argon2.hash(dto.password);
      const user = await this.prismaService.user.create({
        data: { ...dto, password: hash },
      });
      return this.generateJwt(user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Username already taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: UserDto): Promise<TokenDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { username: dto.username },
      });
      if (!user) {
        throw new NotFoundException();
      }
      const isVerified = await argon2.verify(user.password, dto.password);
      if (!isVerified) {
        throw new ForbiddenException();
      }
      return this.generateJwt(user);
    } catch (error) {
      throw error;
    }
  }

  generateJwt(user: User): TokenDto {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
