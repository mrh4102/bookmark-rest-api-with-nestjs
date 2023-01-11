import { Module } from '@nestjs/common';

import { AuthenticationModule } from './authentication/authentication.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [AuthenticationModule, BookmarkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
