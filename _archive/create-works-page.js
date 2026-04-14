const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03'
});

const PARENT_PAGE_ID = '341d597ef70780adb899c21257212013';
const WORKS_DATA_SOURCE_ID = 'fea19b77-a01d-470a-9ea4-0c5336d043ba';

async function createWorksPage() {
  try {
    console.log('Works 페이지를 생성합니다...');
    
    // 1. 페이지 생성
    const page = await notion.pages.create({
      parent: { page_id: PARENT_PAGE_ID },
      properties: {
        title: {
          title: [{ text: { content: 'Works' } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Works' } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: '취미가 너무 많아져서 혼자 바쁩니다.' } }]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        }
      ]
    });

    console.log(`Works 페이지 생성 완료 (ID: ${page.id})`);

    // 2. 갤러리 뷰 생성
    console.log('Works DB를 갤러리 뷰로 연결합니다...');
    await notion.views.create({
      parent: { page_id: page.id }, // 페이지에 뷰를 추가
      name: 'Works Gallery',
      type: 'gallery',
      database_id: '93f46e0d-2634-46e8-87fb-c26da9202a72',
      data_source_id: 'fea19b77-a01d-470a-9ea4-0c5336d043ba',
      configuration: {
        type: 'gallery',
        gallery: {
          card_size: 'medium',
          image_source: 'none' // 미니멀하게
        }
      }
    });

    console.log('Works 페이지 구성 완료!');
    console.log('페이지 URL:', page.url);
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.error(JSON.stringify(error.body, null, 2));
  }
}

createWorksPage();
