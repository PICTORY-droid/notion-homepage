const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';
const ABOUT_PAGE_ID = '341d597e-f707-8122-b79f-fa970f5dd802';
const WORKS_PAGE_ID = '341d597e-f707-8135-a482-f5bf0486cf30';

// 삭제할 블록 ID들 (이전 list-blocks 결과 기반)
const BLOCKS_TO_DELETE = [
  '341d597e-f707-8150-9c8d-db73c6f0ad61', // 기존 Works 🔗 Works paragraph
  '341d597e-f707-81a6-afd2-fbd4966ccfa2', // 기존 About 🔗 About paragraph
  '341d597e-f707-814e-a643-e1ee8ac98c0d', // 기존 Contact paragraph
  ABOUT_PAGE_ID, // About child_page (아이콘)
  WORKS_PAGE_ID  // Works child_page (아이콘)
];

async function reorganizeAgain() {
  try {
    console.log('기존 블록 삭제 중...');
    for (const id of BLOCKS_TO_DELETE) {
      try {
        await notion.blocks.delete({ block_id: id });
        console.log(`삭제됨: ${id}`);
      } catch (e) {
        console.warn(`삭제 실패(무시): ${id} - ${e.message}`);
      }
    }

    console.log('새로운 멘션 블록 추가 중...');
    // Divider(341d597e-f707-8174-8213-e5c8af0bc400) 뒤에 추가하기 위해
    // 이번에는 그냥 append를 사용하고 위치는 노션 UI 특성에 맡깁니다.
    // (이미 중간 블록들이 사라졌으므로 append하면 첫 번째 divider 뒤로 붙게 됩니다)
    
    await notion.blocks.children.append({
      block_id: MAIN_PAGE_ID,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'mention', mention: { type: 'page', page: { id: WORKS_PAGE_ID } } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'mention', mention: { type: 'page', page: { id: ABOUT_PAGE_ID } } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: 'Contact' } }]
          }
        }
      ]
    });

    console.log('메인 페이지 재정리 완료!');
    
    // 최종 확인
    const finalRes = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    console.log('\n--- 최종 블록 목록 ---');
    for (const b of finalRes.results) {
      console.log(`${b.type} | ${b.id}`);
    }

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

reorganizeAgain();
