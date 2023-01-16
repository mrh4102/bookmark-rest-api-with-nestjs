import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { UserDto } from '../src/authentication/dto';
import { CreateBookmarkDto, UpdateBookmarkDto } from '../src/bookmark/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // clear database
    await prismaService.bookmark.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(() => {
    app.close();
  });

  let accessToken1: string = '';
  let accessToken2: string = '';

  describe('User', () => {
    describe('signup user', () => {
      const userDto: UserDto = {
        username: 'username',
        password: 'password',
      };

      it('should require username and password', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send({});
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should require username', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send({ password: userDto.password });
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should require password', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send({ username: userDto.username });
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should signup user', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(userDto);
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.access_token).toBeDefined();
        accessToken1 = response.body.access_token;
      });

      it('should not signup user twice', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send(userDto);
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Username already taken');
        expect(response.body.error).toBe('Bad Request');
      });

      it('should signup another user', async () => {
        const response = await request(app.getHttpServer())
          .post('/signup')
          .send({
            username: 'username2',
            password: 'password2',
          });
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.access_token).toBeDefined();
        accessToken2 = response.body.access_token;
      });
    });

    describe('signin user', () => {
      const userDto: UserDto = {
        username: 'username',
        password: 'password',
      };

      it('should require username and password', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send({});
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should require username', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send({ password: userDto.password });
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should require password', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send({ username: userDto.username });
        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.error).toBe('Bad Request');
      });

      it('should not signin user with invalid username', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send({
            username: userDto.username + 'x',
            password: userDto.password,
          });
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Not Found');
      });

      it('should not signin user with invalid password', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send({
            username: userDto.username,
            password: userDto.password + 'x',
          });
        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should signin user', async () => {
        const response = await request(app.getHttpServer())
          .post('/signin')
          .send(userDto);
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.access_token).toBeDefined();
      });
    });
  });

  let bookmarkId: number = 0;

  describe('Bookmark', () => {
    const createDto: CreateBookmarkDto = {
      title: 'My bookmark',
      description: 'My bookmark description',
      url: 'https://bookmark.com',
    };
    const updateDto: UpdateBookmarkDto = {
      title: createDto.title + 'x',
      description: createDto.description + 'x',
      url: createDto.url + 'x',
    };

    describe('select zero bookmarks initially', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).get('/bookmarks');
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should select zero bookmarks initially', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks')
          .set('Authorization', `Bearer ${accessToken1}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.length).toBe(0);
      });
    });

    describe('create bookmark item', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).post('/bookmarks');
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should create bookmark item', async () => {
        const response = await request(app.getHttpServer())
          .post('/bookmarks')
          .set('Authorization', `Bearer ${accessToken1}`)
          .send(createDto);
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.id).toBeGreaterThan(0);
        expect(response.body.userId).toBeGreaterThan(0);
        expect(response.body).toMatchObject(createDto);
        bookmarkId = response.body.id;
      });
    });

    describe('select one bookmark after creation', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).get('/bookmarks');
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should select one bookmark after creation', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks')
          .set('Authorization', `Bearer ${accessToken1}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.length).toBe(1);
      });
    });

    describe('select bookmark by id', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).get(
          '/bookmarks/' + bookmarkId,
        );
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should require a valid bookmark id', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks/' + bookmarkId + 1)
          .set('Authorization', `Bearer ${accessToken2}`);
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Not Found');
      });

      it('should require a valid user ownership', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken2}`);
        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should select bookmark by id', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken1}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.id).toBeGreaterThan(0);
        expect(response.body.userId).toBeGreaterThan(0);
        expect(response.body).toMatchObject(createDto);
      });
    });

    describe('update bookmark by id', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).patch(
          '/bookmarks/' + bookmarkId,
        );
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should require a valid bookmark id', async () => {
        const response = await request(app.getHttpServer())
          .patch('/bookmarks/' + bookmarkId + 1)
          .set('Authorization', `Bearer ${accessToken2}`)
          .send(updateDto);
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Not Found');
      });

      it('should require a valid user ownership', async () => {
        const response = await request(app.getHttpServer())
          .patch('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken2}`)
          .send(updateDto);
        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should update bookmark by id', async () => {
        const response = await request(app.getHttpServer())
          .patch('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken1}`)
          .send(updateDto);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.id).toBeGreaterThan(0);
        expect(response.body.userId).toBeGreaterThan(0);
        expect(response.body).toMatchObject(updateDto);
      });
    });

    describe('delete bookmark by id', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).delete(
          '/bookmarks/' + bookmarkId,
        );
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should require a valid bookmark id', async () => {
        const response = await request(app.getHttpServer())
          .delete('/bookmarks/' + bookmarkId + 1)
          .set('Authorization', `Bearer ${accessToken2}`);
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Not Found');
      });

      it('should require a valid user ownership', async () => {
        const response = await request(app.getHttpServer())
          .delete('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken2}`);
        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Forbidden');
      });

      it('should delete bookmark by id', async () => {
        const response = await request(app.getHttpServer())
          .delete('/bookmarks/' + bookmarkId)
          .set('Authorization', `Bearer ${accessToken1}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.id).toBeGreaterThan(0);
        expect(response.body.userId).toBeGreaterThan(0);
        expect(response.body).toMatchObject(updateDto);
      });
    });

    describe('select zero bookmarks after deletion', () => {
      it('should require a valid access token', async () => {
        const response = await request(app.getHttpServer()).get('/bookmarks');
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should select zero bookmarks after deletion', async () => {
        const response = await request(app.getHttpServer())
          .get('/bookmarks')
          .set('Authorization', `Bearer ${accessToken1}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.length).toBe(0);
      });
    });
  });
});
