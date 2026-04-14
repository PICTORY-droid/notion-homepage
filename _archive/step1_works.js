const { Client } = require('@notionhq/client');
require('dotenv').config();
const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03' });

async function step1() {
  const toolsRes = await notion.search({ query: 'Tools DB' });
  const tools = toolsRes.results.find(r => r.object === 'data_source' && r.id.includes('588f2690'));
  const toolsItems = (await notion.request({ path: `data_sources/${tools.id}/query`, method: 'post' })).results;
  const toolsMap = {}; toolsItems.forEach(p => toolsMap[p.properties.Name.title[0].plain_text] = p.id);
  
  const catsRes = await notion.search({ query: 'Category DB' });
  const cats = catsRes.results.find(r => r.object === 'data_source' && r.id.includes('d42bef2b'));
  const catItems = (await notion.request({ path: `data_sources/${cats.id}/query`, method: 'post' })).results;
  const catMap = {}; catItems.forEach(p => catMap[p.properties.Name.title[0].plain_text] = p.id);
  
  const worksRes = await notion.search({ query: 'Works DB' });
  const works = worksRes.results.find(r => r.object === 'data_source' && r.id.includes('fea19b77'));
  const worksItems = (await notion.request({ path: `data_sources/${works.id}/query`, method: 'post' })).results;
  
  const updates = [
    { name: '프롬프트 공유 커뮤니티', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], cat: '앱 & 개발' },
    { name: '묘지 커뮤니티', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], cat: '앱 & 개발' },
    { name: '실시간 코인 트래커', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], cat: '앱 & 개발' },
    { name: '건설회사 앱', date: '2025-03-01', tools: ['GitHub', 'Vercel', 'Claude'], cat: '앱 & 개발' },
    { name: '노션 템플릿', date: '2025-02-01', tools: ['Notion', 'Claude'], cat: '노션 템플릿' },
    { name: '가이드라인 영상', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: '디자인' },
    { name: '카드 UI', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: '디자인' },
    { name: 'AI 모션시트', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: 'AI 크리에이티브' },
    { name: '명언 템플릿', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: '디자인' },
    { name: 'IT 트렌드 포스터', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: '디자인' },
    { name: '네일 판촉', date: '2024-12-01', tools: ['Canva', 'Claude'], cat: '디자인' },
    { name: '발매 음원', date: '2024-06-01', tools: ['구글 스프레드시트'], cat: '음악' },
    { name: '색칠북', date: '2024-03-01', tools: ['Canva'], cat: '출판 & 콘텐츠' },
    { name: '결혼식 노트', date: '2024-03-01', tools: ['Canva'], cat: '출판 & 콘텐츠' },
    { name: '전자책', date: '2024-03-01', tools: ['Canva'], cat: '출판 & 콘텐츠' }
  ];

  for (const u of updates) {
    const p = worksItems.find(w => w.properties.Name.title[0]?.plain_text === u.name);
    if (p) {
      await notion.pages.update({
        page_id: p.id,
        properties: {
          'Date': { date: { start: u.date } },
          'Related to Tools DB (Works)': { relation: u.tools.map(t => ({ id: toolsMap[t] })).filter(x => x.id) },
          'Category': { relation: [{ id: catMap[u.cat] }].filter(x => x.id) }
        }
      });
      console.log('Updated:', u.name);
    }
  }
}
step1().catch(console.error);
