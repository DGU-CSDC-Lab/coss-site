const mysql = require('mysql2/promise');

async function checkSlugs() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'local',
    password: 'user_password',
    database: 'coss'
  });

  try {
    console.log('Checking category slugs...');
    
    const [rows] = await connection.execute('SELECT id, name, slug FROM categories');
    
    console.log('Categories with slugs:');
    rows.forEach(row => {
      console.log(`- ${row.name}: "${row.slug}"`);
    });
    
  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await connection.end();
  }
}

checkSlugs();
