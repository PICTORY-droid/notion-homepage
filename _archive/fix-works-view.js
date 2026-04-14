const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03'
});

const WORKS_PAGE_ID = '341d597e-f707-8135-a482-f5bf0486cf30';
const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const DATA_SOURCE_ID = 'fea19b77-a01d-470a-9ea4-0c5336d043ba';

async function run() {
  // 1. notion.views.create 시도
  try {
    console.log('Method 1: notion.views.create 시도 중...');
    await notion.views.create({
      parent: { page_id: WORKS_PAGE_ID },
      name: 'Works Gallery',
      type: 'gallery',
      database_id: WORKS_DB_ID,
      data_source_id: DATA_SOURCE_ID,
      configuration: {
        type: 'gallery',
        gallery: { card_size: 'medium', image_source: 'none' }
      }
    });
    console.log('Method 1 성공: Gallery View가 생성되었습니다.');
    return;
  } catch (e) {
    console.warn('Method 1 실패:', e.message);
  }

  // 2. notion.blocks.children.append로 child_database 시도
  try {
    console.log('Method 2: notion.blocks.children.append 시도 중...');
    await notion.blocks.children.append({
      block_id: WORKS_PAGE_ID,
      children: [
        {
          object: 'block',
          type: 'child_database',
          child_database: { title: 'Works DB' }
        }
      ]
    });
    console.log('Method 2 성공: Database 블록이 추가되었습니다.');
    return;
  } catch (e) {
    console.warn('Method 2 실패:', e.message);
  }

  // 3. embed 블록 시도
  try {
    console.log('Method 3: embed 블록 삽입 시도 중...');
    const dbUrl = `https://www.notion.so/${WORKS_DB_ID.replace(/-/g, '')}`;
    await notion.blocks.children.append({
      block_id: WORKS_PAGE_ID,
      children: [
        {
          object: 'block',
          type: 'embed',
          embed: { url: dbUrl }
        }
      ]
    });
    console.log('Method 3 성공: DB Link가 Embed 되었습니다.');
  } catch (e) {
    console.error('모든 방법 실패:', e.message);
  }
}

run();
