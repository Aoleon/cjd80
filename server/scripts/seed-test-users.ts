/**
 * Seed Test Users for Development
 *
 * Creates test accounts with various permission levels for development/testing.
 *
 * Usage: bun server/scripts/seed-test-users.ts
 */

import { db } from '../db';
import { admins } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

const TEST_USERS = [
  {
    email: 'admin@test.local',
    name: 'Admin Test',
    role: 'super_admin' as const,
    password: 'test123',
    status: 'active' as const,
    isActive: true,
  },
  {
    email: 'manager@test.local',
    name: 'Manager Test',
    role: 'events_manager' as const,
    password: 'test123',
    status: 'active' as const,
    isActive: true,
  },
  {
    email: 'reader@test.local',
    name: 'Reader Test',
    role: 'events_reader' as const,
    password: 'test123',
    status: 'active' as const,
    isActive: true,
  },
];

async function seedTestUsers() {
  console.log('🌱 Seeding test users for development...\n');

  // Check if running in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot seed test users in production!');
    process.exit(1);
  }

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existing = await db
        .select()
        .from(admins)
        .where(eq(admins.email, userData.email))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  User already exists: ${userData.email} (${userData.role})`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      await db.insert(admins).values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error);
    }
  }

  console.log('\n✨ Test users seeding complete!');
  console.log('\n📝 Test Credentials:');
  console.log('   Email: admin@test.local    | Password: test123 | Role: super_admin');
  console.log('   Email: manager@test.local  | Password: test123 | Role: events_manager');
  console.log('   Email: reader@test.local   | Password: test123 | Role: events_reader');
  console.log('\n⚠️  Dev Login Mode:');
  console.log('   Set ENABLE_DEV_LOGIN=true to bypass password checks entirely');
  console.log('   Any password will work with the emails above when enabled');
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
