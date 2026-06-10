using System.Text.Json;
using CapitalLab.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace CapitalLab.Infrastructure.Services;

/// <summary>
/// Redis-backed distributed cache service.
/// Serializes values to JSON. Uses IDistributedCache so tests can swap in-memory.
/// </summary>
public sealed class RedisCacheService(
    IDistributedCache cache,
    ILogger<RedisCacheService> logger) : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var bytes = await cache.GetAsync(key, cancellationToken);
            return bytes is null ? default : JsonSerializer.Deserialize<T>(bytes, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache GET failed for key {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var bytes = JsonSerializer.SerializeToUtf8Bytes(value, JsonOptions);
            var options = new DistributedCacheEntryOptions();

            if (expiry.HasValue)
                options.AbsoluteExpirationRelativeToNow = expiry;
            else
                options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);

            await cache.SetAsync(key, bytes, options, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache SET failed for key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await cache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache REMOVE failed for key {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        // Redis pattern-based deletion requires direct StackExchange.Redis access.
        // Simple approach: we rely on key TTL and explicit removal where possible.
        // Full implementation uses IConnectionMultiplexer scanning — added in Phase 1.
        logger.LogDebug("RemoveByPrefix called for prefix {Prefix} — TTL-based expiry will handle cleanup", prefix);
        await Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        var bytes = await cache.GetAsync(key, cancellationToken);
        return bytes is not null;
    }

    public async Task<T> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null) return cached;

        var value = await factory();
        await SetAsync(key, value, expiry, cancellationToken);
        return value;
    }
}
