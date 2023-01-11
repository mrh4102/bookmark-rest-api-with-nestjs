import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthenticationService } from './authentication.service';
import { UserDto } from './dto';

@Controller()
@UsePipes(new ValidationPipe())
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('signup')
  signup(@Body() dto: UserDto): Promise<User> {
    return this.authenticationService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: UserDto): Promise<User> {
    return this.authenticationService.signin(dto);
  }
}
