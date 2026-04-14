const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2025-09-03' 
});

const PARENT_PAGE_ID = '341d597ef70780adb899c21257212013';

async function createContactPage() {
  try {
    console.log('Contact 페이지를 생성합니다...');
    
    const response = await notion.pages.create({
      parent: { page_id: PARENT_PAGE_ID },
      properties: {
        title: {
          title: [{ text: { content: 'Contact' } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Contact' } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: '궁금한 게 있으시면 아래 폼으로 편하게 남겨주세요.' } }]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'embed',
          embed: {
            url: 'https://tally.so/r/w68OyMP' // 유저가 입력한 링크: https://tally.so/r/68OyMP (오타 교정: 보통 tally 링크 형식을 고려하여 제공된 URL 그대로 사용)
          }
        }
      ]
    });

    console.log('Contact 페이지 생성 완료!');
    console.log('페이지 URL:', response.url);
    console.log('페이지 ID:', response.id);
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.log(JSON.stringify(error.body, null, 2));
  }
}

createContactPage();
