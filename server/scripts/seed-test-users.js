"use strict";
/**
 * Seed Test Users for Development
 *
 * Creates test accounts with various permission levels for development/testing.
 *
 * Usage: bun server/scripts/seed-test-users.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcrypt"));
const TEST_USERS = [
    {
        email: 'admin@test.local',
        name: 'Admin Test',
        role: 'super_admin',
        password: 'test123',
        status: 'active',
        isActive: true,
    },
    {
        email: 'manager@test.local',
        name: 'Manager Test',
        role: 'events_manager',
        password: 'test123',
        status: 'active',
        isActive: true,
    },
    {
        email: 'reader@test.local',
        name: 'Reader Test',
        role: 'events_reader',
        password: 'test123',
        status: 'active',
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
            const existing = await db_1.db
                .select()
                .from(schema_1.admins)
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, userData.email))
                .limit(1);
            if (existing.length > 0) {
                console.log(`⏭️  User already exists: ${userData.email} (${userData.role})`);
                continue;
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            // Insert user
            await db_1.db.insert(schema_1.admins).values({
                ...userData,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created: ${userData.email} (${userData.role})`);
        }
        catch (error) {
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
