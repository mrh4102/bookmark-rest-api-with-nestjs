import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Bookmark } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

describe('BookmarkService', () => {
  let prismaService: PrismaService;
  let bookmarkService: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, BookmarkService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        bookmark: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();

    prismaService = module.get<PrismaService>(PrismaService);
    bookmarkService = module.get<BookmarkService>(BookmarkService);
  });

  describe('select all bookmarks', () => {
    const bookmark: Bookmark = {
      id: 1,
      userId: 1,
      title: 'My bookmark',
      description: 'My bookmark description',
      url: 'https://bookmark.com',
    };
    const userId: number = bookmark.userId;

    it('should select all bookmarks', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findMany')
        .mockResolvedValueOnce([bookmark]);

      const response = bookmarkService.selectAllBookmarks(userId);
      const expected = [bookmark];
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.bookmark.findMany).toBeCalled();
    });
  });

  describe('create bookmark item', () => {
    const bookmark: Bookmark = {
      id: 1,
      userId: 1,
      title: 'My bookmark',
      description: 'My bookmark description',
      url: 'https://bookmark.com',
    };
    const userId: number = bookmark.userId;
    const dto: CreateBookmarkDto = {
      title: bookmark.title,
      description: bookmark.description,
      url: bookmark.url,
    };

    it('should create bookmark item', async () => {
      jest
        .spyOn(prismaService.bookmark, 'create')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.createBookmarkItem(userId, dto);
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.bookmark.create).toBeCalled();
    });
  });

  describe('select bookmark by id', () => {
    const bookmark: Bookmark = {
      id: 1,
      userId: 1,
      title: 'My bookmark',
      description: 'My bookmark description',
      url: 'https://bookmark.com',
    };
    const userId: number = bookmark.userId;
    const bookmarkId: number = bookmark.id;

    it('should throw not found exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(null);

      const response = bookmarkService.selectBookmarkById(
        userId,
        bookmarkId + 1,
      );
      const expected = NotFoundException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should throw forbidden exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.selectBookmarkById(
        userId + 1,
        bookmarkId,
      );
      const expected = ForbiddenException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should select bookmark by id', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.selectBookmarkById(userId, bookmarkId);
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });
  });

  describe('update bookmark by id', () => {
    const bookmark: Bookmark = {
      id: 1,
      userId: 1,
      title: 'My bookmark updated',
      description: 'My bookmark description updated',
      url: 'https://bookmark.com.updated',
    };
    const userId: number = bookmark.userId;
    const bookmarkId: number = bookmark.id;
    const dto: UpdateBookmarkDto = {
      title: bookmark.title,
      description: bookmark.description,
      url: bookmark.url,
    };

    it('should throw not found exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(null);

      const response = bookmarkService.updateBookmarkById(
        userId,
        bookmarkId + 1,
        dto,
      );
      const expected = NotFoundException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should throw forbidden exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.updateBookmarkById(
        userId + 1,
        bookmarkId,
        dto,
      );
      const expected = ForbiddenException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should update bookmark by id', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);
      jest
        .spyOn(prismaService.bookmark, 'update')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.updateBookmarkById(
        userId,
        bookmarkId,
        dto,
      );
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
      expect(prismaService.bookmark.update).toBeCalled();
    });
  });

  describe('delete bookmark by id', () => {
    const bookmark: Bookmark = {
      id: 1,
      userId: 1,
      title: 'My bookmark',
      description: 'My bookmark description',
      url: 'https://bookmark.com',
    };
    const userId: number = bookmark.userId;
    const bookmarkId: number = bookmark.id;

    it('should throw not found exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(null);

      const response = bookmarkService.deleteBookmarkById(
        userId,
        bookmarkId + 1,
      );
      const expected = NotFoundException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should throw forbidden exception', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.deleteBookmarkById(
        userId + 1,
        bookmarkId,
      );
      const expected = ForbiddenException;
      await expect(response).rejects.toBeInstanceOf(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
    });

    it('should delete bookmark by id', async () => {
      jest
        .spyOn(prismaService.bookmark, 'findUnique')
        .mockResolvedValueOnce(bookmark);
      jest
        .spyOn(prismaService.bookmark, 'delete')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkService.deleteBookmarkById(userId, bookmarkId);
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(prismaService.bookmark.findUnique).toBeCalled();
      expect(prismaService.bookmark.delete).toBeCalled();
    });
  });
});
