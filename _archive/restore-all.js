const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

async function listTrashAndRestore() {
  try {
    console.log('--- 휴지통 항목 조회 중 ---');
    const searchRes = await notion.search({
      filter: { property: 'object', value: 'page' }
    });

    // Notion API Search는 in_trash인 것만 따로 모아보는 기능이 제한적일 수 있으나
    // 2026-03-11 버전에서는 검색 결과에 in_trash 상태가 포함됩니다.
    const trashedItems = searchRes.results.filter(item => item.in_trash === true);

    if (trashedItems.length === 0) {
      console.log('휴지통에서 복원할 페이지를 찾지 못했습니다.');
      return;
    }

    console.log(`발견된 휴지통 항목: ${trashedItems.length}개`);
    for (const item of trashedItems) {
      const title = item.properties?.title?.title[0]?.plain_text || 
                    item.properties?.Name?.title[0]?.plain_text || 
                    '제목 없음';
      console.log(`- 복원 대상: ${title} (ID: ${item.id})`);
      
      await notion.pages.update({
        page_id: item.id,
        in_trash: false
      });
      console.log(`  ㄴ 복원 완료`);
    }

    console.log('\n--- 복원 후 메인 페이지 확인 ---');
    const res = await notion.blocks.children.list({ block_id: '341d597ef70780adb899c21257212013' });
    res.results.forEach((b, i) => {
      let info = b.type;
      if (b.type === 'child_page') info += ` (${b.child_page.title})`;
      console.log(`${i + 1}. ${info} | ID: ${b.id}`);
    });

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

listTrashAndRestore();
