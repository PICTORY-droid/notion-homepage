const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2026-03-11'
});

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';
const ABOUT_PAGE_ID = '341d597e-f707-8122-b79f-fa970f5dd802';

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

async function main() {
  try {
    console.log('1. DB 데이터 로드 중...');
    const catRes = await notion.search({ query: 'Category DB' });
    const catDS = catRes.results.find(r => r.object === 'data_source' && r.id.includes('d42bef2b'));
    const catItems = (await notion.request({ path: `data_sources/${catDS.id}/query`, method: 'post' })).results;
    
    const catMap = {};
    for (const cat of catItems) {
      const name = cat.properties.Name.title[0]?.plain_text;
      if (name === '앱 & 랜딩페이지') {
        await notion.pages.update({ page_id: cat.id, in_trash: true });
        console.log('- 앱 & 랜딩페이지 삭제');
      } else if (name) {
        catMap[name] = cat.id;
      }
    }

    const worksRes = await notion.search({ query: 'Works DB' });
    const worksDS = worksRes.results.find(r => r.object === 'data_source' && r.id.includes('fea19b77'));
    const worksItems = (await notion.request({ path: `data_sources/${worksDS.id}/query`, method: 'post' })).results;

    for (const work of worksItems) {
      const title = work.properties.Name.title[0]?.plain_text;
      const target = mapping[title];
      if (target && catMap[target]) {
        if (work.properties.Category.relation[0]?.id !== catMap[target]) {
          await notion.pages.update({
            page_id: work.id,
            properties: { 'Category': { relation: [{ id: catMap[target] }] } }
          });
          console.log(`- 연결 수정: ${title}`);
        }
      }
    }

    console.log('2. About 페이지 정리 중...');
    const aboutBlocks = await notion.blocks.children.list({ block_id: ABOUT_PAGE_ID });
    for (const block of aboutBlocks.results) {
      if (block.type === 'child_database' || block.type === 'embed') {
        await notion.blocks.delete({ block_id: block.id });
        console.log(`- About 블록 삭제: ${block.type}`);
      }
    }

    console.log('3. 메인 페이지 정리 중...');
    const mainBlocks = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    const seen = new Set();
    for (const block of mainBlocks.results) {
      if (block.type === 'child_database') {
        await notion.blocks.delete({ block_id: block.id });
        console.log('- 메인 DB 블록 삭제');
      } else if (block.type === 'child_page') {
        const title = block.child_page.title;
        if (title === 'About' || title === 'Works') {
          if (seen.has(title)) {
            await notion.blocks.delete({ block_id: block.id });
            console.log(`- 메인 중복 페이지 삭제: ${title}`);
          } else {
            seen.add(title);
          }
        }
      }
    }

    console.log('\n--- 최종 확인 ---');
    const finalMain = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    finalMain.results.forEach((b, i) => console.log(`${i+1}. ${b.type}${b.type==='child_page'?` (${b.child_page.title})`:''}`));

  } catch (e) {
    console.error(e.message);
  }
}
main();
