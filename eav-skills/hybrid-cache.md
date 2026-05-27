---
description: Hybrid Storage and Cache Management Skill
---

# Hybrid Storage & Cache Management

This skill covers the native table storage mode features (Hybrid EAV) and the query caching system.

## Hybrid Storage Mode (`cfg table`, `cfg migrate`, `cfg verify`)

Entities can be stored in the standard flexible EAV structure (`t_eav_value`) or mapped to high-performance native database tables. The API automatically routes queries transparently based on the entity's `storage_mode`.

### Table Management

```bash
# Generate table schema SQL (doesn't execute)
node scripts/eav-remote-cli.js cfg table generate student

# Create native table for the entity
node scripts/eav-remote-cli.js cfg table create student

# Check if native table exists
node scripts/eav-remote-cli.js cfg table exists student

# Drop native table (WARNING: deletes all data)
node scripts/eav-remote-cli.js cfg table drop student --force
```

### Data Migration

Migrate data between traditional EAV tables and the native table.

```bash
# Preview migration from EAV to Table
node scripts/eav-remote-cli.js cfg migrate to-table student --dry-run

# Migrate from EAV to Table
node scripts/eav-remote-cli.js cfg migrate to-table student

# Migrate from Table back to EAV (optionally drop the table)
node scripts/eav-remote-cli.js cfg migrate to-eav student --drop-table
```

### Verification

```bash
# Check current storage mode configuration
node scripts/eav-remote-cli.js cfg verify storage-mode student

# Verify data consistency between EAV and native table
node scripts/eav-remote-cli.js cfg verify consistency student

# Run all checks
node scripts/eav-remote-cli.js cfg verify all student
```

## Route Query Cache (`cache`)

Manage the PostgreSQL-based caching layer for route queries. 

```bash
# View cache statistics
node scripts/eav-remote-cli.js cache query

# View detailed cache entries for a specific entity
node scripts/eav-remote-cli.js cache query --entity dorm_buildings --detailed

# Clear all cache
node scripts/eav-remote-cli.js cache clear

# Clear cache for a specific entity
node scripts/eav-remote-cli.js cache clear --entity dorm_buildings

# Drop the cache table (use with caution)
node scripts/eav-remote-cli.js cache drop --confirm
```
