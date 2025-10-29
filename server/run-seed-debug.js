// Direct seed runner with full error output
require('ts-node/register');

async function runSeed() {
  console.log('\n🔬 Running seed with full debug output...\n');
  
  try {
    const { seedEnhancedDatabase } = require('./src/seed.enhanced');
    await seedEnhancedDatabase();
    console.log('\n✅ Seed completed successfully!\n');
  } catch (error) {
    console.error('\n❌ SEED FAILED WITH ERROR:\n');
    console.error(error);
    console.error('\n Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

runSeed();

