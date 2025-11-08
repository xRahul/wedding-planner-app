#!/usr/bin/env tsx
/**
 * Database Setup Script for Neon Postgres
 * 
 * This script initializes the database schema for the wedding planner app.
 * Run this after creating your Neon database.
 * 
 * Usage:
 *   npx tsx scripts/setup-database.ts
 * 
 * Or with explicit DATABASE_URL:
 *   DATABASE_URL=your_connection_string npx tsx scripts/setup-database.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env.local file or as an environment variable');
    process.exit(1);
  }

  console.log('🔌 Connecting to Neon database...');
  
  try {
    const sqlClient = neon(databaseUrl);
    const db = drizzle({ client: sqlClient, schema });

    // Test connection
    console.log('✅ Testing database connection...');
    await sqlClient`SELECT 1`;
    console.log('✅ Database connection successful!');

    // Check if tables already exist
    console.log('\n📊 Checking existing tables...');
    const existingTables = await sqlClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;

    if (existingTables.length > 0) {
      console.log(`⚠️  Found ${existingTables.length} existing tables in the database.`);
      console.log('   If you want to recreate the schema, please drop existing tables first.');
      console.log('   Existing tables:', existingTables.map((t: any) => t.table_name).join(', '));
    }

    console.log('\n📝 Note: Use one of the following methods to create the schema:');
    console.log('   1. Run: npm run db:push (recommended for development)');
    console.log('   2. Run: npm run db:generate && npm run db:migrate (for production)');
    console.log('   3. Use the SQL script in scripts/init-database.sql via Neon SQL Editor');
    
    console.log('\n✅ Database setup check complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

setupDatabase();

