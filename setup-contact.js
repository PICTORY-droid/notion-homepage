const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function createAndSetupContact() {
  try {
    console.log('Contact 페이지 생성 중...');
    const page = await notion.pages.create({
      parent: { page_id: MAIN_PAGE_ID },
      properties: {
        title: {
          title: [{ text: { content: 'Contact' } }]
        }
      }
    });

    console.log(`페이지 생성 완료: ${page.id}`);
    console.log('내용 추가 중...');

    await notion.blocks.children.append({
      block_id: page.id,
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
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: 'https://tally.so/r/68OyMP', link: { url: 'https://tally.so/r/68OyMP' } } }]
          }
        }
      ]
    });

    console.log('설정 완료!');
    console.log('Contact 페이지 ID:', page.id);

  } catch (error) {
    console.error('오류:', error.message);
  }
}

createAndSetupContact();
