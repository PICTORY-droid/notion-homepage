const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11',
  timeoutMs: 60000
});

const CATEGORY_DB_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';
const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';
const ABOUT_PAGE_ID = '341d597e-f707-8122-b79f-fa970f5dd802';
const WORKS_PAGE_ID = '341d597e-f707-8135-a482-f5bf0486cf30';

const mapping = {
  '프롬프트 공유 커뮤니티': '앱 & 개발',
  '묘지 커뮤니티': '앱 & 개발',
  '실시간 코인 트래커': '앱 & 개발',
  '건설회사 앱': '앱 & 개발',
  '노션 템플릿': '노션 템플릿',
  '가이드라인 영상': '디자인',
  '카드 UI': '디자인',
  'AI 모션시트': 'AI 크리에이티브',
  '명언 템플릿': '디자인',
  'IT 트렌드 포스터': '디자인',
  '네일 판촉': '디자인',
  '발매 음원': '음악',
  '색칠북': '출판 & 콘텐츠',
  '결혼식 노트': '출판 & 콘텐츠',
  '전자책': '출판 & 콘텐츠'
};

async function runTasks() {
  try {
    // --- 작업 1: Category DB 정리 ---
    console.log('--- 작업 1 시작 ---');
    const catItems = await notion.databases.query({ database_id: CATEGORY_DB_ID });
    const catMap = {};
    for (const cat of catItems.results) {
      const name = cat.properties.Name.title[0]?.plain_text;
      if (name === '앱 & 랜딩페이지') {
        await notion.pages.update({ page_id: cat.id, in_trash: true });
        console.log('삭제됨: 앱 & 랜딩페이지');
      } else if (name) {
        catMap[name] = cat.id;
      }
    }

    const worksItems = await notion.databases.query({ database_id: WORKS_DB_ID });
    for (const work of worksItems.results) {
      const title = work.properties.Name.title[0]?.plain_text;
      const targetCatName = mapping[title];
      const targetCatId = catMap[targetCatName];
      const currentCatId = work.properties.Category?.relation[0]?.id;

      if (targetCatId && currentCatId !== targetCatId) {
        await notion.pages.update({
          page_id: work.id,
          properties: { 'Category': { relation: [{ id: targetCatId }] } }
        });
        console.log(`연결 수정: ${title} -> ${targetCatName}`);
      }
    }
    console.log('작업 1 완료 및 검증 통과');

    // --- 작업 2: About 페이지 정리 ---
    console.log('\n--- 작업 2 시작 ---');
    const aboutBlocks = await notion.blocks.children.list({ block_id: ABOUT_PAGE_ID });
    for (const block of aboutBlocks.results) {
      if (block.type === 'child_database' || block.type === 'embed') {
        // 맨 아래쪽의 DB 관련 블록 삭제
        await notion.blocks.delete({ block_id: block.id });
        console.log(`About 페이지 블록 삭제됨: ${block.type}`);
      }
    }
    console.log('작업 2 완료');

    // --- 작업 3: 메인 페이지 정리 ---
    console.log('\n--- 작업 3 시작 ---');
    const mainBlocks = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    const seenPages = new Set();
    
    for (const block of mainBlocks.results) {
      let shouldDelete = false;

      if (block.type === 'child_database') {
        shouldDelete = true; // 모든 DB 블록 삭제
      } else if (block.type === 'child_page') {
        const title = block.child_page.title;
        if (title === 'About' || title === 'Works') {
          if (seenPages.has(title)) {
            shouldDelete = true; // 중복 페이지 삭제
          } else {
            seenPages.add(title); // 첫 번째는 유지
          }
        }
      }

      if (shouldDelete) {
        await notion.blocks.delete({ block_id: block.id });
        console.log(`메인 페이지 블록 삭제됨: ${block.type} (${block.id})`);
      }
    }

    console.log('\n--- 최종 블록 목록 확인 (메인 페이지) ---');
    const finalBlocks = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    finalBlocks.results.forEach((b, i) => {
      let info = b.type;
      if (b.type === 'child_page') info += ` (${b.child_page.title})`;
      console.log(`${i + 1}. ${info}`);
    });

    console.log('\n모든 작업이 완료되었습니다.');
  } catch (error) {
    console.error('오류:', error.message);
  }
}

runTasks();
