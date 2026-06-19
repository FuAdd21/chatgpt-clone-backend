
import db from './db/db.config.js';

async function runMigration() {
  try {
    console.log('Connecting to cloud database...');
    
    // Execute your exact schema configuration
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        token_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('🎉 Database table created successfully in the cloud!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
