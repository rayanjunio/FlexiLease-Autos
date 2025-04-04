import { RedisClientType, createClient } from 'redis';
import { config } from './dotenv';

let redisClient: RedisClientType;

(async () => {
  redisClient = createClient({
    url: config.REDIS_URL,
  });

  redisClient.on('error', (error: any) => console.error(error));

  await redisClient.connect();
})();

export { redisClient };