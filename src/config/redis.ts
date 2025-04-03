import { RedisClientType, createClient } from 'redis';

let redisClient: RedisClientType;

(async () => {
  redisClient = createClient({
    url: 'redis://localhost:6379',
  });

  redisClient.on('error', (error: any) => console.error(error));

  await redisClient.connect();
})();

export { redisClient };