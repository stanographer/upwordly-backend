const request = require('supertest');
const app = require('../app');

describe('Test the root path', () => {
  require('custom-env').env('test', './');
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('It should response the GET method', () => {
    process.env.NODE_ENV = 'test';

    return request(app).get('/').then(response => {
      expect(response.statusCode).toBe(200);
    });
  });
});
