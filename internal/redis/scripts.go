package redis

const TokenBucketScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])
local ttl_ms = tonumber(ARGV[5])

local tokens = tonumber(redis.call("HGET", key, "tokens"))
local last_refill = tonumber(redis.call("HGET", key, "last_refill"))

if tokens == nil or last_refill == nil then
  tokens = capacity
  last_refill = now_ms
end

local elapsed = math.max(0, now_ms - last_refill) / 1000
tokens = math.min(capacity, tokens + (elapsed * refill_rate))

local allowed = 0
local retry_after = 0

if tokens >= requested then
  allowed = 1
  tokens = tokens - requested
else
  local missing = requested - tokens
  retry_after = math.ceil(missing / refill_rate)
end

redis.call("HSET", key, "tokens", tokens, "last_refill", now_ms)
redis.call("PEXPIRE", key, ttl_ms)

return { allowed, math.floor(tokens), retry_after, capacity }
`

const SlidingWindowScript = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local member = ARGV[4]
local ttl_ms = tonumber(ARGV[5])

redis.call("ZREMRANGEBYSCORE", key, 0, now_ms - window_ms)
local count = tonumber(redis.call("ZCARD", key))

if count < limit then
  redis.call("ZADD", key, now_ms, member)
  redis.call("PEXPIRE", key, ttl_ms)
  return {1, limit - count - 1, 0, limit}
end

local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
local retry_after = 1
if oldest[2] ~= nil then
  retry_after = math.ceil(((tonumber(oldest[2]) + window_ms) - now_ms) / 1000)
  if retry_after < 1 then retry_after = 1 end
end
redis.call("PEXPIRE", key, ttl_ms)
return {0, 0, retry_after, limit}
`
