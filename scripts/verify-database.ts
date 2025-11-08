#!/usr/bin/env tsx
/**
 * Database Verification Script
 * 
 * Verifies that all required tables and enums exist in the database.
 * 
 * Usage:
 *   npx tsx scripts/verify-database.ts
 */

import { neon } from '@neondatabase/serverless';

async function verifyDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Verifying database schema...\n');
  
  const sql = neon(databaseUrl);

  try {
    // Check required enums
    const requiredEnums = [
      'event_type',
      'rsvp_status',
      'vendor_status',
      'task_status',
      'task_priority',
      'user_role',
    ];

    console.log('📋 Checking ENUMs...');
    const enumResults = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname
    `;
    
    const existingEnums = enumResults.map((e: any) => e.typname);
    const missingEnums = requiredEnums.filter(e => !existingEnums.includes(e));
    
    if (missingEnums.length > 0) {
      console.error(`❌ Missing ENUMs: ${missingEnums.join(', ')}`);
    } else {
      console.log(`✅ All ${requiredEnums.length} required ENUMs exist`);
    }

    // Check required tables
    const requiredTables = [
      'weddings',
      'wedding_events',
      'event_timeline',
      'guests',
      'guest_groups',
      'vendors',
      'vendor_services',
      'vendor_assignments',
      'vendor_contracts',
      'budget_categories',
      'budget_items',
      'expenses',
      'menus',
      'menu_items',
      'dance_performances',
      'performance_participants',
      'tasks',
      'task_dependencies',
      'task_checklists',
      'guest_travel_details',
      'accommodation_bookings',
      'transportation_arrangements',
      'media_files',
      'notes',
      'communication_log',
      'wedding_users',
    ];

    console.log('\n📊 Checking tables...');
    const tableResults = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const existingTables = tableResults.map((t: any) => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error(`❌ Missing tables (${missingTables.length}):`);
      missingTables.forEach(table => console.error(`   - ${table}`));
    } else {
      console.log(`✅ All ${requiredTables.length} required tables exist`);
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexResults = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname
    `;
    console.log(`✅ Found ${indexResults.length} indexes`);

    // Summary
    console.log('\n' + '='.repeat(50));
    if (missingEnums.length === 0 && missingTables.length === 0) {
      console.log('✅ Database verification PASSED');
      console.log(`   - ${existingEnums.length} ENUMs`);
      console.log(`   - ${existingTables.length} tables`);
      console.log(`   - ${indexResults.length} indexes`);
      process.exit(0);
    } else {
      console.log('❌ Database verification FAILED');
      console.log('\nTo fix:');
      console.log('   1. Run: npm run db:push');
      console.log('   2. Or use the SQL script: scripts/init-database.sql');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyDatabase();

