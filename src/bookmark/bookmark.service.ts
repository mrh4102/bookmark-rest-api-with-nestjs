import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bookmark } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async selectAllBookmarks(userId: number): Promise<Bookmark[]> {
    const bookmarks = await this.prismaService.bookmark.findMany({
      where: { userId },
    });
    return bookmarks;
  }

  async createBookmarkItem(
    userId: number,
    dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.create({
      data: { userId, ...dto },
    });
    return bookmark;
  }

  async selectBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    if (!bookmark) {
      throw new NotFoundException();
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException();
    }
    return bookmark;
  }

  async updateBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    if (!bookmark) {
      throw new NotFoundException();
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException();
    }
    return await this.prismaService.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<Bookmark> {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    if (!bookmark) {
      throw new NotFoundException();
    }
    if (bookmark.userId !== userId) {
      throw new ForbiddenException();
    }
    return await this.prismaService.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
