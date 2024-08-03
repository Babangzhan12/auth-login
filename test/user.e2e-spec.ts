
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;


  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);

    testService = app.get(TestService);
  });


  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
          password: '',
          name: '',
          email: ''
        });

      logger.info(response.body);

      expect(response.status).toBe(500);
      expect(response.body.message).toBeDefined();
    });
    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
          email: "test@gmail.com"
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');
    });
    it('should be rejected if username already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
          email: 'test@gmail.com'
        });

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: 'test',
          password: 'test',
          name: 'test',
          email: "test@gmail.com"
        });

      logger.info(response.body);

      expect(response.status).toBe(500);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {

    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
    });
    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
          password: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.email).toBe('test@gmail.com');
      expect(response.body.data).toHaveProperty('token');
    });
  });

  describe('GET /api/users/current', () => {
    let token: string;

    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      token = loginResponse.body.data.token;
      logger.info('Token:', token);
    });
    it('should be rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'wrong');

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body.message).toBeDefined();
    });

    it('should be able to get user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', `Bearer ${token}`);

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });
  });

  describe('PATCH /api/users/current', () => {
    let token: string;

    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      token = loginResponse.body.data.token;
      logger.info('Token:', token);
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: '',
          name: '',
          email: '',
          role: ''
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });

    it('should be able to update name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'test updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test updated');
    });

    it('should be able to update password', async () => {
      let response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');

      response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('DELETE /api/users/:username', () => {
    let token: string;

    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      token = loginResponse.body.data.token;
      logger.info('Token:', token);
    });

    it('should be rejected if request is user role is not ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/zhan2')
        .set('Authorization', `Bearer ${token}`);

      logger.info(response.body);

      expect(response.status).toBe(403);
      expect(response.body).toBeDefined();
    });

    it('should be able to delete with user role ADMIN', async () => {
      let response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'zhan',
          password: 'zhan1',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      const token = response.body.data.token;
      expect(token).toBeDefined();

      response = await request(app.getHttpServer())
        .delete('/api/users/test')
        .set('Authorization', `Bearer ${token}`)

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
