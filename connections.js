// Mongo and Redis Servers

const mongo = () => {
  return require('sharedb-mongo')(
    process.env.NODE_ENV === 'production'
      ? `mongodb://${ process.env.MONGO_IP }/upwordly`
      : 'mongodb://localhost:27017/aloft',
  );
};

const redis = () => {
  return require('sharedb-redis-pubsub')(
    process.env.NODE_ENV === 'production'
      ? `redis://${ process.env.REDIS_IP }`
      : 'redis://localhost:6379',
  );
};

module.exports = {
  mongo,
  redis,
};
