export const getRedisConfig = (url: string) => {
  const isSecure = url.startsWith('rediss://') || url.includes('upstash');
  return {
    ...(isSecure ? { tls: { rejectUnauthorized: false } } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 0,
  };
};
