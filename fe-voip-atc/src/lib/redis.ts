// // redis.ts
// import Redis from "ioredis";

// export const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD,
// });

import Redis from "ioredis";

export function createRedis() {
  console.log(
    "🧪 Creating Redis with",
    process.env.REDIS_HOST,
    process.env.REDIS_PORT
  );
  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });
}
