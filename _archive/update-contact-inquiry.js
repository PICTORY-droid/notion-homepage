const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';
const INQUIRY_DB_ID = 'caed6b97-0fd8-4d66-8eeb-21b6abba3383';

async function run() {
  try {
    // 1. Contact 페이지 삭제
    console.log('작업 1: Contact 페이지 블록 찾는 중...');
    const blocks = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    const contactPageBlock = blocks.results.find(b => b.type === 'child_page' && b.child_page.title === 'Contact');
    
    if (contactPageBlock) {
      await notion.blocks.delete({ block_id: contactPageBlock.id });
      console.log(`성공: Contact 페이지(${contactPageBlock.id}) 삭제 완료`);
    } else {
      console.log('알림: 삭제할 Contact 페이지를 찾지 못했습니다.');
    }

    // 2. Inquiry DB 페이지에 내용 추가
    console.log('\n작업 2: Inquiry DB 페이지에 내용 추가 중...');
    await notion.blocks.children.append({
      block_id: INQUIRY_DB_ID,
      children: [
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
            url: 'https://tally.so/r/68OyMP'
          }
        }
      ]
    });
    console.log('성공: Inquiry DB 페이지 내용 구성 완료');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

run();
