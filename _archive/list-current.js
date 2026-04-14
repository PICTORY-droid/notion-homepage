const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function listCurrentBlocks() {
  try {
    console.log('--- 현재 메인 페이지 블록 목록 ---');
    const res = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    res.results.forEach((b, i) => {
      let info = b.type;
      if (b.type === 'child_page') info += ` (${b.child_page.title})`;
      if (b.type === 'child_database') info += ` (${b.child_database.title})`;
      console.log(`${i + 1}. ID: ${b.id} | Type: ${info}`);
    });
  } catch (error) {
    console.error('오류:', error.message);
  }
}

listCurrentBlocks();
