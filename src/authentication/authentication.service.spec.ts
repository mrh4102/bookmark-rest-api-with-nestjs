import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuthenticationService } from './authentication.service';
import { UserDto } from './dto';

describe('AuthenticationService', () => {
  let prismaService: PrismaService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, AuthenticationService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      })
      .compile();

    prismaService = module.get<PrismaService>(PrismaService);
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
    const dto: UserDto = {
      username,
      password,
    };

    it('should signup user', async () => {
      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce(user);

      const response = authenticationService.signup(dto);
      const expected = user;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.user.create).toBeCalled();
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
    const dto: UserDto = {
      username,
      password,
    };

    it('should throw not found exception', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      const response = authenticationService.signin({
        username: dto.username + 'x',
        password: dto.password,
      });
      const expected = NotFoundException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.user.findUnique).toBeCalled();
    });

    it('should throw forbidden exception', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);

      const response = authenticationService.signin({
        username: dto.username,
        password: dto.password + 'x',
      });
      const expected = ForbiddenException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.user.findUnique).toBeCalled();
    });

    it('should signin user', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);

      const response = authenticationService.signin(dto);
      const expected = user;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.user.findUnique).toBeCalled();
    });
  });
});
