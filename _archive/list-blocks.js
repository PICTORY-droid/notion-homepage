const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2025-09-03' 
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function listBlocks() {
  try {
    const res = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    for (const b of res.results) {
      let info = '';
      if (b.type === 'child_page') info = b.child_page.title;
      console.log(`${b.id} | ${b.type} | ${info}`);
    }
  } catch (error) {
    console.error(error.message);
  }
}

listBlocks();
