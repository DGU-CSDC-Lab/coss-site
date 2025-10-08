const mysql = require('mysql2/promise');

// 카테고리 이름을 slug로 변환하는 매핑
const nameToSlugMap = {
  '소식': 'news-updates',
  '장학정보': 'scholarship-info', 
  '뉴스': 'news',
  '자료실': 'resources',
  '공지사항': 'notices',
  '공모전/채용 정보': 'contest-jobs',
  '공모전 정보': 'contest',
  '교육/활동/취업 정보': 'activities'
};

async function migrateCategorySlugs() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'local',
    password: 'user_password',
    database: 'coss'
  });

  try {
    console.log('Starting category slug migration...');

    for (const [name, slug] of Object.entries(nameToSlugMap)) {
      const [result] = await connection.execute(
        'UPDATE categories SET slug = ? WHERE name = ?',
        [slug, name]
      );
      console.log(`Updated "${name}" -> "${slug}": ${result.affectedRows} rows`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrateCategorySlugs();
