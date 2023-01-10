import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Bookmark } from '@prisma/client';

import { User } from '../app.decorator';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@Controller('bookmarks')
@UsePipes(new ValidationPipe())
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  selectAllBookmarks(@User('id') userId: number): Promise<Bookmark[]> {
    return this.bookmarkService.selectAllBookmarks(userId);
  }

  @Post()
  createBookmarkItem(
    @User('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarkService.createBookmarkItem(userId, dto);
  }

  @Get(':id')
  selectBookmarkById(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<Bookmark> {
    return this.bookmarkService.selectBookmarkById(userId, bookmarkId);
  }

  @Patch(':id')
  updateBookmarkById(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarkService.updateBookmarkById(userId, bookmarkId, dto);
  }

  @Delete(':id')
  deleteBookmarkById(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ): Promise<Bookmark> {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
