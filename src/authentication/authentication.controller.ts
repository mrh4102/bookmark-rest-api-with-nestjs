import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { TokenDto, UserDto } from './dto';

@Controller()
@UsePipes(new ValidationPipe())
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('signup')
  signup(@Body() dto: UserDto): Promise<TokenDto> {
    return this.authenticationService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: UserDto): Promise<TokenDto> {
    return this.authenticationService.signin(dto);
  }
}
