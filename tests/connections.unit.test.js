const { mongo, redis } = require('../connections');

let mongodb;
let redisdb;

beforeAll(async() => {
  process.env = Object.assign(process.env, {
    NODE_ENV: 'production',
    MONGO_IP: '165.227.187.41:27017',
    REDIS_IP: '134.209.40.72:6379',
  });

  mongodb = await mongo();
  redisdb = await redis();
});

afterAll(async() => {
  await mongodb.close();
  await redisdb.close();
});

describe('Should return correct Mongo and Redis addresses depending on environment.', () => {
  it('Returns remote server', async() => {
    await expect(mongodb).toHaveProperty('mongo');
  });

  it('Returns remote Redis server', async() => {
     await expect(redisdb).toHaveProperty('_defaultCallback');
  })
});
