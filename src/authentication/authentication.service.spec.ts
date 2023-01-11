import * as argon2 from 'argon2';

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

import { PrismaService } from '../prisma/prisma.service';
import { AuthenticationService } from './authentication.service';
import { TokenDto, UserDto } from './dto';

describe('AuthenticationService', () => {
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, JwtService, AuthenticationService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      })
      .overrideProvider(JwtService)
      .useValue({
        sign: jest.fn(),
      })
      .compile();

    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  describe('signup user', () => {
    const username: string = 'username';
    const password: string = 'password';
    const user: User = {
      id: 1,
      username,
      password,
    };
    const userDto: UserDto = {
      username,
      password,
    };
    const tokenDto: TokenDto = {
      access_token: 'token',
    };

    beforeAll(async () => {
      user.password = await argon2.hash(password);
    });

    it('should throw bad request exception', async () => {
      jest.spyOn(prismaService.user, 'create').mockImplementationOnce(() => {
        throw new PrismaClientKnownRequestError('unique constraint', {
          clientVersion: '1.0.0',
          code: 'P2002',
        });
      });

      const response = authenticationService.signup(userDto);
      const expected = BadRequestException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.user.create).toBeCalled();
    });

    it('should signup user', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokenDto.access_token);

      const response = authenticationService.signup(userDto);
      const expected = tokenDto;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.user.create).toBeCalled();
      expect(jwtService.sign).toBeCalled();
    });
  });

  describe('signin user', () => {
    const username: string = 'username';
    const password: string = 'password';
    const user: User = {
      id: 1,
      username,
      password,
    };
    const userDto: UserDto = {
      username,
      password,
    };
    const tokenDto: TokenDto = {
      access_token: 'token',
    };

    beforeAll(async () => {
      user.password = await argon2.hash(password);
    });

    it('should throw not found exception', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      const response = authenticationService.signin({
        username: userDto.username + 'x',
        password: userDto.password,
      });
      const expected = NotFoundException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.user.findUnique).toBeCalled();
    });

    it('should throw forbidden exception', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);

      const response = authenticationService.signin({
        username: userDto.username,
        password: userDto.password + 'x',
      });
      const expected = ForbiddenException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.user.findUnique).toBeCalled();
    });

    it('should signin user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(tokenDto.access_token);

      const response = authenticationService.signin(userDto);
      const expected = tokenDto;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.user.findUnique).toBeCalled();
      expect(jwtService.sign).toBeCalled();
    });
  });
});
