# Database Pooling - Integration Guide

**Quick Integration Steps for Teams**

---

## For Developers: Using Database Pooling in Your Code

### Step 1: Import the runDbQuery wrapper

```typescript
import { runDbQuery } from '../../../db';
```

### Step 2: Use appropriate timeout profiles

```typescript
// In your service or controller:

// Quick queries (2s timeout, no retry)
const count = await runDbQuery(
  async () => db.select().from(users).limit(1),
  'quick'
);

// Normal queries (5s timeout with retry)
const user = await runDbQuery(
  async () => db.select().from(users).where(eq(users.id, id)),
  'normal'
);

// Complex queries (10s timeout with retry)
const result = await runDbQuery(
  async () => db.insert(transactions).values(data).returning(),
  'complex'
);

// Background jobs (15s timeout with retry)
const report = await runDbQuery(
  async () => db.select().from(reports).where(...),
  'background'
);
```

### Step 3: Add error handling

```typescript
try {
  const result = await runDbQuery(queryFn, 'normal');
  return result;
} catch (error) {
  logger.error('Database query failed', {
    error,
    poolMetrics: getPoolMetrics() // Log pool state
  });
  throw error;
}
```

### Step 4: Monitor pool health (optional but recommended)

```typescript
import { checkPoolHealth, getPoolMetrics } from '../../../utils/database-config.utils';

// In your initialization or middleware:
const alert = checkPoolHealth();
if (alert) {
  logger.warn('Pool health alert', alert);
}

// Log metrics periodically
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    logger.debug('Pool metrics', getPoolMetrics());
  }, 30000);
}
```

---

## For Operations: Monitoring and Alerting

### Step 1: Set up health check monitoring

```bash
# Health check endpoint (public)
curl http://localhost:5000/api/health/db

# Detailed metrics (requires JWT)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/health/detailed

# Full system status
curl http://localhost:5000/api/status/all
```

### Step 2: Configure Kubernetes probes

```yaml
spec:
  containers:
    - name: api
      livenessProbe:
        httpGet:
          path: /api/health/live
          port: 5000
        initialDelaySeconds: 10
        periodSeconds: 10

      readinessProbe:
        httpGet:
          path: /api/health/ready
          port: 5000
        initialDelaySeconds: 5
        periodSeconds: 5
```

### Step 3: Set up alerts

Monitor these metrics:
- **Pool utilization** > 70%: Warning (investigate)
- **Pool utilization** > 90%: Critical (scale now)
- **Waiting requests** > 0: Check for bottlenecks
- **Circuit breaker open** > 30s: Database issues

### Step 4: Create monitoring dashboard

```bash
# Watch pool status continuously
watch -n 5 'curl -s http://localhost:5000/api/health/detailed | \
  jq ".database.pool"'

# Or in your monitoring tool (Prometheus):
# cjd_db_pool_utilization_percent
# cjd_db_pool_active_connections
# cjd_db_pool_waiting_requests
```

---

## For DevOps: Deployment and Scaling

### Configuration

```bash
# Required
export DATABASE_URL=postgresql://...
export NODE_ENV=production

# Optional: override defaults
export DATABASE_POOL_MIN=5      # Default: 5 (prod), 2 (dev)
export DATABASE_POOL_MAX=20     # Default: 20 (prod), 5 (dev)
```

### Deployment Steps

1. **Pre-deployment**
   ```bash
   # Verify configuration
   npx tsc --noEmit  # Should be 0 errors

   # Review health endpoints
   curl http://localhost:5000/api/health/db
   ```

2. **During deployment**
   ```bash
   # Monitor pool during deployment
   watch -n 2 'curl -s http://localhost:5000/api/health/detailed | jq ".database.pool"'

   # Check logs for errors
   docker logs <container> | grep -i "pool\|error\|timeout"
   ```

3. **Post-deployment**
   ```bash
   # Verify endpoints responding
   curl http://localhost:5000/api/health/db
   curl http://localhost:5000/api/status/all

   # Enable monitoring
   # Configure alerts
   # Update runbooks
   ```

### Scaling Decisions

**Scale UP when:**
- Pool utilization > 70% for 5+ minutes
- Requests waiting in queue
- Response times increasing

**Scale UP configuration:**
```bash
export DATABASE_POOL_MIN=10
export DATABASE_POOL_MAX=30
docker restart <container>
```

**Monitor after scaling:**
```bash
watch -n 5 'curl -s http://localhost:5000/api/health/detailed | \
  jq ".database.pool"'
```

---

## Testing the Integration

### Unit Tests

```bash
# Run the included tests
npm test -- database-pool.config.spec.ts

# Verify all pass
# ✅ Pool stats calculation
# ✅ Health check functions
# ✅ Timeout suggestion
# ✅ Configuration validation
```

### Load Testing

```bash
# Simulate load with concurrent requests
ab -n 1000 -c 100 http://localhost:5000/api/health/db

# Monitor pool during test
watch -n 1 'curl -s http://localhost:5000/api/health/detailed | \
  jq ".database.pool"'

# Verify:
# - No connection timeouts
# - Pool utilization reasonable
# - Response times acceptable
```

### Failover Testing

```bash
# Stop database
docker stop postgres

# Verify health endpoint shows unhealthy
curl http://localhost:5000/api/health/db
# Should return: "status": "unhealthy"

# Restart database
docker start postgres

# Verify recovery
curl http://localhost:5000/api/health/db
# Should return: "status": "healthy"
```

---

## Documentation Reference

### Quick Links

| Document | For | Size | Read Time |
|----------|-----|------|-----------|
| DATABASE_POOLING.md | Complete reference | 2500+ lines | 30-40 min |
| DATABASE_POOLING_QUICK_START.md | Quick reference | 200+ lines | 5-10 min |
| DATABASE_POOLING_VALIDATION.md | Verification | 300+ lines | 10-15 min |
| DATABASE_INDEX.md | Navigation | Short | 5 min |

### Key Sections

**Configuration**:
- `/server/src/config/database.config.ts` - Central config
- Environment-specific values in `database.config.ts`

**Utilities**:
- `/server/utils/database-config.utils.ts` - Helper functions
- Use for monitoring and health checks

**Examples**:
- `/server/src/common/database/database-pool.example.ts` - 7 working examples
- Copy-paste ready code

**Tests**:
- `/server/src/common/database/__tests__/database-pool.config.spec.ts` - Unit tests

---

## Common Patterns

### Pattern 1: Basic Query with Error Handling

```typescript
async getUserById(userId: number) {
  try {
    const user = await runDbQuery(
      async () => db.select().from(users).where(eq(users.id, userId)),
      'normal'
    );
    return user;
  } catch (error) {
    logger.error('Failed to get user', { userId, error });
    throw new UserNotFoundError(userId);
  }
}
```

### Pattern 2: Batch Operations

```typescript
async insertUsers(users: User[]) {
  return runDbQuery(
    async () => db.insert(usersTable).values(users).returning(),
    'complex'  // Longer timeout for bulk operations
  );
}
```

### Pattern 3: With Pool Health Check

```typescript
async criticalOperation() {
  // Check pool is healthy before critical operation
  const alert = checkPoolHealth();
  if (alert?.severity === 'critical') {
    throw new Error('Database pool exhausted - operation cancelled');
  }

  return runDbQuery(
    async () => db.select().from(critical_data),
    'normal'
  );
}
```

### Pattern 4: Monitoring in Middleware

```typescript
import {
  enrichContextWithPoolStats,
  checkPoolHealth
} from '../utils/database-config.utils';

@Injectable()
export class DatabaseMonitoringMiddleware {
  use(req, res, next) {
    // Enrich logs with pool stats
    const context = enrichContextWithPoolStats({
      requestId: req.id,
      path: req.path
    });

    // Check pool health
    const alert = checkPoolHealth();
    if (alert) {
      logger.warn('Pool alert during request', { context, alert });
    }

    next();
  }
}
```

---

## Troubleshooting Quick Reference

### "Connection timeout" errors

**Cause**: Pool too small or timeout too short

**Fix**:
```bash
# Increase pool
export DATABASE_POOL_MAX=30
docker restart <container>

# Or increase timeout (if appropriate)
# Change profile from 'normal' to 'complex' if needed
```

### "Pool exhausted" errors

**Cause**: All connections in use

**Fix**:
1. Check for N+1 queries
2. Increase pool size
3. Scale horizontally

### High memory usage

**Cause**: Unoptimized queries (no LIMIT)

**Fix**:
1. Add LIMIT to all queries
2. Paginate results
3. Use streaming for large datasets

### Slow responses

**Cause**: Pool saturation

**Fix**:
1. Monitor `/api/health/detailed`
2. Check if utilization > 70%
3. Scale if needed

---

## Next Steps

1. **Read** `/docs/DATABASE_INDEX.md` (navigation)
2. **Review** `/docs/DATABASE_POOLING_QUICK_START.md` (quick start)
3. **Integrate** `runDbQuery()` in your services
4. **Monitor** `/api/health/detailed` endpoint
5. **Test** with your expected load
6. **Deploy** with confidence

---

## Support

**Questions?** Check:
1. `/docs/DATABASE_POOLING.md` - Comprehensive guide
2. `/server/src/common/database/database-pool.example.ts` - Working examples
3. `/docs/DATABASE_POOLING_VALIDATION.md` - Testing guide

**Issues?** See troubleshooting in DATABASE_POOLING.md (pages 350-450)

---

**Ready to integrate? Start with Step 1 above!**
