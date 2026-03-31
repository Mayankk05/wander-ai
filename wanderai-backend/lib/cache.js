import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 });

export function getCached(key) {
  const val = cache.get(key);
  return val === undefined ? null : val;
}

export function setCached(key, value) {
  return cache.set(key, value);
}

export function deleteCached(key) {
  return cache.del(key);
}

export function getCacheKey(prefix, ...parts) {
  return [prefix, ...parts].join(":");
}
