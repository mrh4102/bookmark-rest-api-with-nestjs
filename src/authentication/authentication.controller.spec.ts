import * as argon2 from 'argon2';

import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { TokenDto, UserDto } from './dto';

describe('AuthenticationController', () => {
  let authenticationService: AuthenticationService;
  let authenticationController: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [AuthenticationService],
    })
      .overrideProvider(AuthenticationService)
      .useValue({
        signup: jest.fn(),
        signin: jest.fn(),
      })
      .compile();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    authenticationController = module.get<AuthenticationController>(
      AuthenticationController,
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

    it('should signup user', async () => {
      jest
        .spyOn(authenticationService, 'signup')
        .mockResolvedValueOnce(tokenDto);

      const response = authenticationController.signup(userDto);
      const expected = tokenDto;
      await expect(response).resolves.toEqual(expected);
      expect(authenticationService.signup).toBeCalled();
      expect(authenticationService.signup).toBeCalledWith(userDto);
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

    it('should signin user', async () => {
      jest
        .spyOn(authenticationService, 'signin')
        .mockResolvedValueOnce(tokenDto);

      const response = authenticationController.signin(userDto);
      const expected = tokenDto;
      await expect(response).resolves.toEqual(expected);
      expect(authenticationService.signin).toBeCalled();
      expect(authenticationService.signin).toBeCalledWith(userDto);
    });
  });
});
