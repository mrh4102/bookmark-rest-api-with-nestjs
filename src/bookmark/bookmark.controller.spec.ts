import { Test, TestingModule } from '@nestjs/testing';
import { Bookmark } from '@prisma/client';

import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, UpdateBookmarkDto } from './dto';

describe('BookmarkController', () => {
  let bookmarkService: BookmarkService;
  let bookmarkController: BookmarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [BookmarkService],
    })
      .overrideProvider(BookmarkService)
      .useValue({
        selectAllBookmarks: jest.fn(),
        createBookmarkItem: jest.fn(),
        selectBookmarkById: jest.fn(),
        updateBookmarkById: jest.fn(),
        deleteBookmarkById: jest.fn(),
      })
      .compile();

    bookmarkService = module.get<BookmarkService>(BookmarkService);
    bookmarkController = module.get<BookmarkController>(BookmarkController);
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
        .spyOn(bookmarkService, 'selectAllBookmarks')
        .mockResolvedValueOnce([bookmark]);

      const response = bookmarkController.selectAllBookmarks(userId);
      const expected = [bookmark];
      await expect(response).resolves.toEqual(expected);
      expect(bookmarkService.selectAllBookmarks).toBeCalled();
      expect(bookmarkService.selectAllBookmarks).toBeCalledWith(userId);
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
        .spyOn(bookmarkService, 'createBookmarkItem')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkController.createBookmarkItem(userId, dto);
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(bookmarkService.createBookmarkItem).toBeCalled();
      expect(bookmarkService.createBookmarkItem).toBeCalledWith(userId, dto);
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

    it('should select bookmark by id', async () => {
      jest
        .spyOn(bookmarkService, 'selectBookmarkById')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkController.selectBookmarkById(
        userId,
        bookmarkId,
      );
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(bookmarkService.selectBookmarkById).toBeCalled();
      expect(bookmarkService.selectBookmarkById).toBeCalledWith(
        userId,
        bookmarkId,
      );
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

    it('should update bookmark by id', async () => {
      jest
        .spyOn(bookmarkService, 'updateBookmarkById')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkController.updateBookmarkById(
        userId,
        bookmarkId,
        dto,
      );
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(bookmarkService.updateBookmarkById).toBeCalled();
      expect(bookmarkService.updateBookmarkById).toBeCalledWith(
        userId,
        bookmarkId,
        dto,
      );
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

    it('should delete bookmark by id', async () => {
      jest
        .spyOn(bookmarkService, 'deleteBookmarkById')
        .mockResolvedValueOnce(bookmark);

      const response = bookmarkController.deleteBookmarkById(
        userId,
        bookmarkId,
      );
      const expected = bookmark;
      await expect(response).resolves.toEqual(expected);
      expect(bookmarkService.deleteBookmarkById).toBeCalled();
      expect(bookmarkService.deleteBookmarkById).toBeCalledWith(
        userId,
        bookmarkId,
      );
    });
  });
});
