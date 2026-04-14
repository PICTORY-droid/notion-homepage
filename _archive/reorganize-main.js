const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';
const ABOUT_PAGE_ID = '341d597e-f707-8122-b79f-fa970f5dd802';
const WORKS_PAGE_ID = '341d597e-f707-8135-a482-f5bf0486cf30';

async function reorganize() {
  try {
    // 1. 블록 조회
    console.log('블록 조회 중...');
    const res = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    
    // 2. About, Works 제외한 모든 블록 삭제
    console.log('불필요한 블록 삭제 중...');
    for (const block of res.results) {
      if (block.id !== ABOUT_PAGE_ID && block.id !== WORKS_PAGE_ID) {
        await notion.blocks.delete({ block_id: block.id });
      }
    }

    // 3. 새 블록을 최상단에 추가 (position: start)
    console.log('새 블록 추가 중...');
    await notion.blocks.children.append({
      block_id: MAIN_PAGE_ID,
      position: { type: 'start' },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: '디자인, 음악, 코드 — 만들고 싶은 게 생기면 배워서 만듭니다' } }]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { type: 'text', text: { content: 'Works ' } },
              { type: 'mention', mention: { type: 'page', page: { id: WORKS_PAGE_ID } } }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { type: 'text', text: { content: 'About ' } },
              { type: 'mention', mention: { type: 'page', page: { id: ABOUT_PAGE_ID } } }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: 'Contact' } }]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        }
      ]
    });

    console.log('메인 페이지 정리 완료!');
    
    // 4. 최종 목록 확인
    const finalRes = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    console.log('\n--- 최종 블록 목록 ---');
    for (const b of finalRes.results) {
      console.log(`${b.type}`);
    }

  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.log(JSON.stringify(error.body, null, 2));
  }
}

reorganize();
