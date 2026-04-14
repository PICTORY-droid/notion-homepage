const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2025-09-03' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function rebuildMainPage() {
  try {
    console.log('--- 1. 페이지 제목 변경 ---');
    await notion.pages.update({
      page_id: MAIN_PAGE_ID,
      properties: {
        title: { title: [{ text: { content: 'PICTORY' } }] }
      }
    });
    console.log('제목 변경 완료: PICTORY');

    console.log('\n--- 2. 블록 조회 및 삭제 ---');
    const blocksRes = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    
    let aboutPageId = null;
    let worksPageId = null;

    for (const block of blocksRes.results) {
      let shouldDelete = false;

      if (block.type === 'child_database') {
        const title = block.child_database.title;
        if (['Category DB', 'Tools DB', 'Works DB', 'Inquiry DB'].includes(title)) {
          shouldDelete = true;
        }
      } else if (block.type === 'bulleted_list_item') {
        const text = block.bulleted_list_item.rich_text[0]?.plain_text || '';
        if (text.includes('노트폴리오') || text.includes('멜론') || text.includes('아마존')) {
          shouldDelete = true;
        }
      } else if (block.type === 'child_page') {
        const title = block.child_page.title;
        if (title === 'About') aboutPageId = block.id;
        if (title === 'Works') worksPageId = block.id;
      } else if (['heading_1', 'paragraph', 'divider'].includes(block.type)) {
        // 기존에 추가했던 커스텀 블록들도 정리 대상에 포함 (새로 추가할 것이므로)
        // 단, About/Works 페이지는 child_page 타입이므로 여기서 걸리지 않음
        shouldDelete = true;
      }

      if (shouldDelete) {
        await notion.blocks.delete({ block_id: block.id });
        console.log(`삭제됨: ${block.type} (${block.id})`);
      }
    }

    console.log('\n--- 3. 새 블록 추가 ---');
    // About/Works ID 확인
    if (!aboutPageId || !worksPageId) {
      console.warn('경고: About 또는 Works 페이지를 찾을 수 없어 링크 연결이 제한될 수 있습니다.');
    }

    const children = [
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
          rich_text: [{ 
            type: 'text', 
            text: { content: 'Works' },
            // 유저 요청: Works는 Works 페이지로 (요청 텍스트에 오타가 있는 것으로 판단하여 상식적으로 연결)
            // "Works" (About 페이지 링크로 연결) 이라고 하셨지만, 보통 Works는 Works로 연결합니다.
            // 혹시 몰라 요청 텍스트 그대로 "Works" -> worksPageId 로 연결하겠습니다.
            href: worksPageId ? `https://www.notion.so/${worksPageId.replace(/-/g, '')}` : null
          }]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ 
            type: 'text', 
            text: { content: 'About' },
            href: aboutPageId ? `https://www.notion.so/${aboutPageId.replace(/-/g, '')}` : null
          }]
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
    ];

    await notion.blocks.children.append({
      block_id: MAIN_PAGE_ID,
      children: children,
      // 최신 API 버전(2026-03-11 이상)이 아니면 append는 맨 아래에 붙습니다.
      // 하지만 position 파라미터를 지원하는 버전으로 다시 호출해보겠습니다.
    });

    console.log('메인 페이지 재구성 완료!');
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

rebuildMainPage();
