const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const DB_IDS = [
  'caed6b97-0fd8-4d66-8eeb-21b6abba3383', // Inquiry DB
  '9fb48552-32b5-4909-b710-4c0b27ae7cfb', // Category DB
  '4d5e33aa-7540-4fed-af3f-dd8cdb913c49', // Tools DB
  '93f46e0d-2634-46e8-87fb-c26da9202a72'  // Works DB
];

async function restoreDatabases() {
  try {
    console.log('--- DB 복원 시도 중 ---');
    for (const id of DB_IDS) {
      try {
        await notion.databases.update({
          database_id: id,
          in_trash: false
        });
        console.log(`성공: DB 복원 완료 (${id})`);
      } catch (e) {
        console.error(`실패: DB 복원 오류 (${id}) - ${e.message}`);
      }
    }

    console.log('\n--- 메인 페이지 블록 재확인 ---');
    const res = await notion.blocks.children.list({ block_id: '341d597ef70780adb899c21257212013' });
    res.results.forEach((b, i) => {
      let info = b.type;
      if (b.type === 'child_page') info += ` (${b.child_page.title})`;
      if (b.type === 'child_database') info += ` (${b.child_database.title})`;
      console.log(`${i + 1}. ${info} | ID: ${b.id}`);
    });

  } catch (error) {
    console.error('전체 오류:', error.message);
  }
}

restoreDatabases();
