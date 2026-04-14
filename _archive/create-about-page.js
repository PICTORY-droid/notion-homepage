const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03'
});

const PARENT_PAGE_ID = '341d597ef70780adb899c21257212013';

async function createAboutPage() {
  try {
    console.log('About 페이지를 생성합니다...');
    
    const response = await notion.pages.create({
      parent: { page_id: PARENT_PAGE_ID },
      properties: {
        title: {
          title: [{ text: { content: 'About' } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'PICTORY' } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: '디자인을 시작으로 음악, 책, 코드까지 — 하고 싶은 게 생기면 일단 만들어봅니다. 평생 배우는 중이에요.' } }]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Tools' } }]
          }
        },
        // Tools 리스트 (개별 불렛으로 구성)
        ...['Canva', 'Claude', 'Notion', 'GitHub', 'Vercel', '구글 스프레드시트'].map(tool => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: tool } }]
          }
        })),
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Links' } }]
          }
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
        }
      ]
    });

    console.log('About 페이지 생성 완료!');
    console.log('페이지 URL:', response.url);
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.error(JSON.stringify(error.body, null, 2));
  }
}

createAboutPage();
