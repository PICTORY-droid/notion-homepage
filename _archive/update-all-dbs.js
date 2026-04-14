const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2022-06-28' 
});

const INQUIRY_DB_ID = 'caed6b97-0fd8-4d66-8eeb-21b6abba3383';
const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const CATEGORY_DB_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';
const TOOLS_DB_ID = '4d5e33aa-7540-4fed-af3f-dd8cdb913c49';

async function updateAll() {
  try {
    // 1. Inquiry DB 속성 추가
    console.log('1. Inquiry DB 속성 업데이트 중...');
    await notion.request({
      path: `databases/${INQUIRY_DB_ID}`,
      method: 'patch',
      body: {
        properties: {
          'Email': { 'email': {} },
          'Message': { 'rich_text': {} },
          'Date': { 'created_time': {} },
          'Works': { 'relation': { 'database_id': WORKS_DB_ID, 'single_property': {} } }
        }
      }
    });
    console.log('Inquiry DB 완료');

    // 2. Category DB & Works DB Relation 수정
    console.log('2. Category DB Rollup 기반 마련을 위한 Relation 수정 중...');
    await notion.request({
      path: `databases/${WORKS_DB_ID}`,
      method: 'patch',
      body: {
        properties: {
          'Category': {
            'relation': {
              'database_id': CATEGORY_DB_ID,
              'dual_property': { 'name': 'Works' }
            }
          }
        }
      }
    });

    // 3 & 4. 데이터 맵핑 및 업데이트
    console.log('3 & 4. Works 데이터 업데이트 시작...');
    
    const toolsRes = await notion.databases.query({ database_id: TOOLS_DB_ID });
    const toolsMap = {};
    toolsRes.results.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) toolsMap[name] = p.id;
    });

    const catRes = await notion.databases.query({ database_id: CATEGORY_DB_ID });
    const categoryMap = {};
    catRes.results.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) categoryMap[name] = p.id;
    });

    const worksRes = await notion.databases.query({ database_id: WORKS_DB_ID });
    
    for (const page of worksRes.results) {
      const title = page.properties.Name.title[0]?.plain_text;
      if (!title) continue;

      let dateVal = null;
      let toolsList = [];
      let catName = null;

      if (['프롬프트 공유 커뮤니티', '묘지 커뮤니티', '실시간 코인 트래커', '건설회사 앱'].includes(title)) {
        dateVal = '2025-03-01';
        toolsList = ['GitHub', 'Vercel', 'Claude'];
        catName = '앱 & 개발';
      } else if (title === '노션 템플릿') {
        dateVal = '2025-02-01';
        toolsList = ['Notion', 'Claude'];
        catName = '노션 템플릿';
      } else if (['가이드라인 영상', '카드 UI', 'AI 모션시트', '명언 템플릿', 'IT 트렌드 포스터', '네일 판촉'].includes(title)) {
        dateVal = '2024-12-01';
        toolsList = ['Canva', 'Claude'];
      } else if (title === '발매 음원') {
        dateVal = '2024-06-01';
        toolsList = ['구글 스프레드시트'];
        catName = '음악';
      } else if (['색칠북', '결혼식 노트', '전자책'].includes(title)) {
        dateVal = '2024-03-01';
        toolsList = ['Canva'];
        catName = '출판 & 콘텐츠';
      }

      const props = {};
      if (dateVal) props['Date'] = { date: { start: dateVal } };
      if (toolsList.length > 0) {
        const relationIds = toolsList.map(t => toolsMap[t]).filter(id => id);
        if (relationIds.length > 0) {
          props['Tools'] = { relation: relationIds.map(id => ({ id })) };
        }
      }
      if (catName && categoryMap[catName]) {
        props['Category'] = { relation: [{ id: categoryMap[catName] }] };
      }

      if (Object.keys(props).length > 0) {
        await notion.pages.update({ page_id: page.id, properties: props });
        console.log(`업데이트 완료: ${title}`);
      }
    }
    console.log('모든 작업 완료!');
  } catch (error) {
    console.error('오류:', error.message);
    if (error.body) console.log(JSON.stringify(error.body, null, 2));
  }
}

updateAll();
