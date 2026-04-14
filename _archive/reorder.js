const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const PAGE_ID = '341d597ef70780adb899c21257212013';
const ABOUT_ID = '341d597e-f707-8122-b79f-fa970f5dd802';
const WORKS_ID = '341d597e-f707-8135-a482-f5bf0486cf30';

async function reorder() {
  try {
    const sequence = [
      { type: 'new', block: { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: '디자인, 음악, 코드 — 만들고 싶은 게 생기면 배워서 만듭니다' } }] } } },
      { type: 'new', block: { object: 'block', type: 'divider', divider: {} } },
      { type: 'new', block: { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'mention', mention: { type: 'page', page: { id: WORKS_ID } } }] } } },
      { type: 'new', block: { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'mention', mention: { type: 'page', page: { id: ABOUT_ID } } }] } } },
      { type: 'new', block: { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'Contact' } }] } } },
      { type: 'new', block: { object: 'block', type: 'divider', divider: {} } }
    ];

    console.log('상단 블록 재배치 중...');
    // position: start를 쓰면 역순으로 넣어야 정순이 됨
    for (let i = sequence.length - 1; i >= 0; i--) {
      await notion.blocks.children.append({
        block_id: PAGE_ID,
        position: { type: 'start' },
        children: [sequence[i].block]
      });
    }

    console.log('재정렬 완료!');
    
    const finalRes = await notion.blocks.children.list({ block_id: PAGE_ID });
    console.log('\n--- 현재 블록 순서 ---');
    finalRes.results.forEach((b, i) => console.log(`${i+1}. ${b.type}`));

  } catch (error) {
    console.error(error.message);
  }
}

reorder();
