import { Module } from '@nestjs/common';

import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [BookmarkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
