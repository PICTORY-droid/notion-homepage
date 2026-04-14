const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2025-09-03',
  timeoutMs: 60000
});

const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const TOOLS_DB_ID = '4d5e33aa-7540-4fed-af3f-dd8cdb913c49';
const CATEGORY_DB_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';
const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function main() {
  try {
    console.log('--- 데이터 수집 시작 ---');
    
    const toolsRes = await notion.databases.query({ database_id: TOOLS_DB_ID });
    const toolsMap = {};
    toolsRes.results.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) toolsMap[name] = p.id;
    });
    console.log('Tools 수집 완료');

    const catRes = await notion.databases.query({ database_id: CATEGORY_DB_ID });
    const categoryMap = {};
    catRes.results.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) categoryMap[name] = p.id;
    });
    console.log('Categories 수집 완료');

    const worksRes = await notion.databases.query({ database_id: WORKS_DB_ID });
    console.log('Works DB 수집 완료:', worksRes.results.length, '개 항목');
    
    const updates = [
      { name: '프롬프트 공유 커뮤니티', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], category: '앱 & 개발' },
      { name: '묘지 커뮤니티', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], category: '앱 & 개발' },
      { name: '실시간 코인 트래커', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], category: '앱 & 개발' },
      { name: '건설회사 앱', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], category: '앱 & 개발' },
      { name: '노션 템플릿', date: '2025-02-01', tools: ['Notion', 'Claude'], category: '노션 템플릿' },
      { name: '가이드라인 영상', date: '2024-12-01', tools: ['Canva', 'Claude'], category: '디자인' },
      { name: '카드 UI', date: '2024-12-01', tools: ['Canva', 'Claude'], category: '디자인' },
      { name: 'AI 모션시트', date: '2024-12-01', tools: ['Canva', 'Claude'], category: 'AI 크리에이티브' },
      { name: '명언 템플릿', date: '2024-12-01', tools: ['Canva', 'Claude'], category: '디자인' },
      { name: 'IT 트렌드 포스터', date: '2024-12-01', tools: ['Canva', 'Claude'], category: '디자인' },
      { name: '네일 판촉', date: '2024-12-01', tools: ['Canva', 'Claude'], category: '디자인' },
      { name: '발매 음원', date: '2024-06-01', tools: ['구글 스프레드시트'], category: '음악' },
      { name: '색칠북', date: '2024-03-01', tools: ['Canva'], category: '출판 & 콘텐츠' },
      { name: '결혼식 노트', date: '2024-03-01', tools: ['Canva'], category: '출판 & 콘텐츠' },
      { name: '전자책', date: '2024-03-01', tools: ['Canva'], category: '출판 & 콘텐츠' }
    ];

    console.log('\n--- 작업 1 & 2: Works DB 순차 업데이트 ---');
    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const page = worksRes.results.find(p => p.properties.Name.title[0]?.plain_text === update.name);
      if (page) {
        const props = {
          'Date': { date: { start: update.date } },
          'Tools': { relation: update.tools.map(t => ({ id: toolsMap[t] })).filter(t => t.id) },
          'Category': { relation: [{ id: categoryMap[update.category] }].filter(c => c.id) }
        };
        await notion.pages.update({ page_id: page.id, properties: props });
        console.log(`[${i+1}/${updates.length}] ${update.name} 업데이트 완료`);
      }
    }

    console.log('\n--- 작업 3: About 페이지 링크 추가 ---');
    const mainChildren = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
    const aboutPageBlock = mainChildren.results.find(b => b.type === 'child_page' && b.child_page.title === 'About');
    
    if (aboutPageBlock) {
      const links = [
        { text: 'YES24: ', url: 'https://www.yes24.com/product/goods/140375062' },
        { text: 'GitHub: ', url: 'https://github.com/PICTORY-droid' },
        { text: 'Vercel 앱: ', url: 'https://promptshare-woad.vercel.app/' }
      ];

      await notion.blocks.children.append({
        block_id: aboutPageBlock.id,
        children: links.map(l => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: l.text } },
              { type: 'text', text: { content: l.url, link: { url: l.url } } }
            ]
          }
        }))
      });
      console.log('About 페이지 링크 추가 완료');
    }

    console.log('\n--- 최종 검증: Category DB Rollup 확인 ---');
    const catVerify = await notion.databases.retrieve({ database_id: CATEGORY_DB_ID });
    // API로는 rollup의 실시간 계산 결과를 직접 가져오기 어려울 수 있으므로 릴레이션 연결 상태 확인
    const worksVerify = await notion.databases.query({ database_id: WORKS_DB_ID });
    const linkedCount = worksVerify.results.filter(p => p.properties.Category.relation.length > 0).length;
    console.log(`검증: ${worksVerify.results.length}개 항목 중 ${linkedCount}개 항목 카테고리 연결됨`);

    console.log('\n모든 작업이 완료되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

main();
