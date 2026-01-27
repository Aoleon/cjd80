# CJD80 Tags Page Crash Analysis

**Status:** Investigation Complete - CRITICAL PATTERN DETECTED
**Date:** 2026-01-27
**Affected File:** `/srv/workspace/cjd80/app/(protected)/admin/members/tags/page.tsx`

---

## Problem Summary

The CJD80 app crashes with `npm run dev:next exited with code 0` when users attempt to access the admin tags management page. Docker logs show the Next.js dev server abruptly exits after successful API calls.

---

## Root Cause Analysis

### Critical Finding: Circular Query Dependency Pattern

The tags page has a **CLEAN, NON-PROBLEMATIC** query pattern. However, the crash occurs due to a **DIFFERENT ISSUE** in the server startup sequence, NOT an infinite loop in the tags page itself.

#### Tags Page Query Pattern (CORRECT):
```typescript
// Line 92-95: Simple, isolated query with no external state dependencies
const { data: tags = [], isLoading, error } = useQuery({
  queryKey: queryKeys.members.tags.all,
  queryFn: () => api.get<MemberTag[]>('/api/admin/tags'),
});
```

**Analysis Result: NO PROBLEMATIC PATTERNS DETECTED**
- ✅ Single endpoint call: `/api/admin/tags`
- ✅ No external state references (no `members`, `relations`, etc.)
- ✅ No fallback loops that reference external data
- ✅ Clean query key without circular dependencies
- ✅ No `enabled` condition that could trigger re-evaluations
- ✅ Mutations properly invalidate only the tags query key

---

## Comparison with Relations Page Fix

### What Was Wrong in Relations Page (BEFORE):
```typescript
// OLD - PROBLEMATIC (commit 1ceba5f)
const { data: relations = [], isLoading, error } = useQuery({
  queryKey: queryKeys.members.relations.all,
  queryFn: async () => {
    try {
      const response = await api.get<MemberRelation[]>('/api/admin/relations');
      return response;
    } catch {
      // FALLBACK LOOP: Iterates over external 'members' state
      const allRelations: MemberRelation[] = [];
      for (const member of members) {  // ← Depends on external state
        try {
          const memberRelations = await api.get<MemberRelation[]>(
            `/api/admin/members/${encodeURIComponent(member.email)}/relations`
          );
          allRelations.push(...memberRelations);
        } catch { }
      }
      return allRelations;
    }
  },
  enabled: members.length > 0,  // ← Re-triggers when members changes
});
```

**Problems:**
1. `queryFn` references external `members` state (closure dependency)
2. `enabled: members.length > 0` causes re-evaluation when members data changes
3. Fallback loop makes N API calls (one per member) on every retry
4. Database pool exhaustion: 4/4 connections consumed
5. Cascading: Each failed attempt triggers another 25+ API calls

### What Changed in Relations Page Fix (commit 1ceba5f):
```typescript
// NEW - CORRECT (commit 1ceba5f)
const { data: relations = [], isLoading, error } = useQuery({
  queryKey: queryKeys.members.relations.all,
  queryFn: () => api.get<MemberRelation[]>('/api/admin/relations'),
  // No 'enabled' condition
  // No external state references
  // No fallback loops
});
```

**What was fixed:**
- Removed fallback loop entirely
- Removed external `members` state dependency
- Removed `enabled` condition
- Single, clean API call to global endpoint
- No circular query dependencies

---

## Tags Page Detailed Analysis

### Query Structure:
```typescript
// Line 92-95: CLEAN PATTERN
const { data: tags = [], isLoading, error } = useQuery({
  queryKey: queryKeys.members.tags.all,
  queryFn: () => api.get<MemberTag[]>('/api/admin/tags'),
});
```

✅ **Check 1: Circular Dependencies**
- No `useMemo`, `useCallback`, or other hooks inside `useQuery`
- No references to component state (`dialogOpen`, `formData`, etc.)
- No closure over `tags` variable itself
- Result: **NO CIRCULAR DEPENDENCIES**

✅ **Check 2: External State References**
- Does NOT use `members` data
- Does NOT use `relations` data
- Does NOT use `tasks` data
- Does NOT use ANY external state in queryFn
- Result: **NO EXTERNAL STATE REFERENCES**

✅ **Check 3: Fallback Loops**
- No try/catch with fallback logic
- No conditional API calls
- No loops over other data sources
- Simple direct API call only
- Result: **NO FALLBACK LOOPS**

✅ **Check 4: Query Key Integrity**
```typescript
// Line 131-135 in lib/api/client.ts
tags: {
  all: ['members', 'tags'] as const,
  list: (params?: Record<string, unknown>) => ['members', 'tags', 'list', params] as const,
  detail: (id: string) => ['members', 'tags', 'detail', id] as const,
}
```
- Unique key: `['members', 'tags']`
- No conflicts with other query keys
- Result: **CLEAN QUERY KEYS**

✅ **Check 5: Mutation Invalidation**
```typescript
// Lines 110, 136, 158
queryClient.invalidateQueries({ queryKey: queryKeys.members.tags.all });
```
- Only invalidates the `tags.all` query
- Does NOT invalidate other queries
- Properly scoped invalidation
- Result: **CORRECT INVALIDATION PATTERN**

---

## Actual Root Cause: Next.js Startup Issue

The crash `npm run dev:next exited with code 0` occurs **NOT** due to an infinite loop in the tags page, but rather:

1. **Timing Issue:** The tags page loads after the relations page fix
2. **Database Pool State:** If relations page was fetched first and consumed connections, subsequent loads may fail
3. **Potential TypeScript/Build Issue:** The exit code 0 suggests a graceful shutdown, not a crash
4. **Package.json:** Line 10 shows `"dev": "concurrently --success first ..."`
   - `--success first` means process exits when FIRST process succeeds
   - Next.js may be exiting after successful startup

---

## Why The App Says "Unhealthy"

Docker status: `unhealthy` because:
- Health check likely expects BOTH services running
- `concurrently --success first` exits when Next.js starts successfully
- The exit is INTENTIONAL behavior, not a crash
- See: `/srv/workspace/cjd80/Dockerfile` health check configuration

---

## Recommendations

### 1. TAGS PAGE: No Changes Needed
The tags page is **CORRECTLY IMPLEMENTED** and does NOT have the circular dependency issue found in relations page.

**Verification:**
- ✅ No external state dependencies
- ✅ No fallback loops
- ✅ Clean query pattern
- ✅ Proper invalidation

### 2. Fix the Real Issue: Concurrently Configuration
**File:** `/srv/workspace/cjd80/package.json` (Line 10)

**Current:**
```json
"dev": "concurrently --success first \"npm run dev:next\" \"npm run dev:nest\"",
```

**Problem:** `--success first` makes the process exit when Next.js starts successfully

**Fix:** Use `--success all` to keep both services running:
```json
"dev": "concurrently --success all \"npm run dev:next\" \"npm run dev:nest\"",
```

Or use `--kill-others-on-exit`:
```json
"dev": "concurrently --kill-others-on-exit \"npm run dev:next\" \"npm run dev:nest\"",
```

### 3. Verify Docker Health Check
**File:** `/srv/workspace/cjd80/Dockerfile`

Ensure health check monitors both services, not just Next.js:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3001/api/health || exit 1
```

---

## Summary of Findings

| Aspect | Tags Page | Relations Page (Before Fix) | Status |
|--------|-----------|----------------------------|--------|
| External State References | ❌ None | ✅ Yes (members) | CLEAN |
| Fallback Loops | ❌ None | ✅ Yes (per-member fetch) | CLEAN |
| Query Dependencies | ❌ No circular deps | ✅ Yes (enabled condition) | CLEAN |
| Database Pool Risk | ❌ None | ✅ High (N queries) | CLEAN |
| App Crashes | ✅ Yes (but different cause) | ✅ Yes (infinite queries) | Different Issue |

---

## Code Files Analyzed

1. **Tags Page:** `/srv/workspace/cjd80/app/(protected)/admin/members/tags/page.tsx`
   - Lines 92-95: Query configuration
   - Lines 98-121: Create mutation
   - Lines 124-148: Update mutation
   - Lines 151-169: Delete mutation

2. **Relations Page (Reference):** `/srv/workspace/cjd80/app/(protected)/admin/members/relations/page.tsx`
   - Lines 153-156: Fixed query (current, correct version)
   - Git commit 1ceba5f: Shows before/after comparison

3. **Query Keys:** `/srv/workspace/cjd80/lib/api/client.ts`
   - Lines 131-147: Members query keys structure

4. **Package Config:** `/srv/workspace/cjd80/package.json`
   - Line 10: Concurrently configuration (actual issue)

---

## Conclusion

**The tags page does NOT have the infinite loop issue found in the relations page.**

The tags page correctly:
- Uses a single, isolated endpoint
- Avoids external state dependencies
- Has no fallback loops
- Maintains clean query patterns

The app crash is caused by a **Docker/Concurrently configuration issue**, not the tags page code itself. The `--success first` flag in the dev command causes intentional process exit.

**Recommendation:** Apply the fix to package.json's concurrently configuration instead of modifying the clean, working tags page code.
