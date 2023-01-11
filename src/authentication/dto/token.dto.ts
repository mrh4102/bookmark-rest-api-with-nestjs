import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;
}
