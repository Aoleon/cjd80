import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createFeatureConfigTable() {
  try {
    console.log("Creating feature_config table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feature_config (
        id SERIAL PRIMARY KEY,
        feature_key TEXT NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT true NOT NULL,
        updated_by TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS feature_config_key_idx ON feature_config(feature_key)
    `);
    
    console.log("✅ Table feature_config created successfully!");
    
    // Vérifier que la table existe
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'feature_config'
      )
    `);
    
    console.log("✅ Table verification:", result.rows[0]);
    
  } catch (error) {
    console.error("❌ Error creating table:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

createFeatureConfigTable()
  .then(() => {
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });

