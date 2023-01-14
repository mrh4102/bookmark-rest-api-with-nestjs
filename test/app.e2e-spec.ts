import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { UserDto } from '../src/authentication/dto';
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
});
