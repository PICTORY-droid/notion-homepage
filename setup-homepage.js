const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2026-03-11'
});

const PAGE_ID = '341d597ef70780adb899c21257212013';

async function setupHomepage() {
  try {
    console.log('메인 페이지 구성을 위해 블록을 추가합니다...');
    
    await notion.blocks.children.append({
      block_id: PAGE_ID,
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: 'PICTORY' } }]
          }
        },
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
              { type: 'text', text: { content: 'Works  ' } },
              { type: 'text', text: { content: '•  ' }, annotations: { color: 'gray' } },
              { type: 'text', text: { content: 'About  ' } },
              { type: 'text', text: { content: '•  ' }, annotations: { color: 'gray' } },
              { type: 'text', text: { content: 'Contact' } }
            ]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: '노트폴리오: ' } },
              { type: 'text', text: { content: 'https://notefolio.net/_Pictory', link: { url: 'https://notefolio.net/_Pictory' } } }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: '멜론: ' } },
              { type: 'text', text: { content: 'https://www.melon.com/album/detail.htm?albumId=12411323', link: { url: 'https://www.melon.com/album/detail.htm?albumId=12411323' } } }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: '아마존: ' } },
              { type: 'text', text: { content: 'https://www.amazon.com/dp/B0CHMBWN4X', link: { url: 'https://www.amazon.com/dp/B0CHMBWN4X' } } }
            ]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        }
      ],
      // 2026-03-11 버전에서는 position: { type: 'start' } 를 사용할 수 있습니다.
      position: { type: 'start' }
    });

    console.log('홈페이지 구성 완료!');
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.error(JSON.stringify(error.body, null, 2));
  }
}

setupHomepage();
