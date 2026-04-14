const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN, 
  notionVersion: '2025-09-03',
  timeoutMs: 60000
});

const CATEGORY_DB_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';
const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const TOOLS_DB_ID = '4d5e33aa-7540-4fed-af3f-dd8cdb913c49';

const CATEGORY_DS_ID = 'd42bef2b-5e41-4bad-b474-059a0aafb9e3';
const WORKS_DS_ID = 'fea19b77-a01d-470a-9ea4-0c5336d043ba';
const TOOLS_DS_ID = '588f2690-03b1-4994-9d14-3f847b384a12';

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

async function execute() {
  try {
    console.log('--- 작업 1: Category DB Works 컬럼 문제 해결 ---');
    
    // 1. Category DB ID/Name 맵핑
    const catRes = await notion.request({ path: `data_sources/${CATEGORY_DS_ID}/query`, method: 'post' });
    const catMap = {};
    catRes.results.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) catMap[name] = p.id;
    });
    console.log('Category 맵 구축 완료');

    // 2. Works DB 전수 조사 및 수정
    const worksRes = await notion.request({ path: `data_sources/${WORKS_DS_ID}/query`, method: 'post' });
    console.log(`Works DB 총 ${worksRes.results.length}개 항목 검사 중...`);

    for (const work of worksRes.results) {
      const title = work.properties.Name.title[0]?.plain_text;
      const currentCatRelation = work.properties.Category?.relation || [];
      const targetCatName = mapping[title];
      const targetCatId = catMap[targetCatName];

      // 현재 연결된 ID가 targetCatId와 다른 경우에만 업데이트
      if (targetCatId && (!currentCatRelation[0] || currentCatRelation[0].id !== targetCatId)) {
        await notion.pages.update({
          page_id: work.id,
          properties: {
            'Category': { relation: [{ id: targetCatId }] }
          }
        });
        console.log(`[수정] ${title} -> ${targetCatName}`);
      }
    }

    // 3. Category DB Works 컬럼 확인
    console.log('\n--- 작업 1 검증: Category DB의 Works 데이터 ---');
    const finalCatRes = await notion.request({ path: `data_sources/${CATEGORY_DS_ID}/query`, method: 'post' });
    finalCatRes.results.forEach(c => {
      const name = c.properties.Name.title[0].plain_text;
      const worksCount = c.properties['Works']?.relation?.length || 0;
      console.log(`- ${name}: 연결된 작업물 ${worksCount}개`);
    });

    console.log('\n--- 작업 2: 가이드라인 영상 Tools 수정 ---');

    // 1. Tools DB에 Vrew 추가 (이미 있으면 무시)
    const toolsQuery = await notion.request({ path: `data_sources/${TOOLS_DS_ID}/query`, method: 'post' });
    let vrewId = toolsQuery.results.find(p => p.properties.Name.title[0]?.plain_text === 'Vrew')?.id;

    if (!vrewId) {
      const newTool = await notion.pages.create({
        parent: { database_id: TOOLS_DB_ID },
        properties: {
          'Name': { title: [{ text: { content: 'Vrew' } }] }
        }
      });
      vrewId = newTool.id;
      console.log('Tools DB에 Vrew 추가 완료');
    } else {
      console.log('Vrew 항목이 이미 존재합니다.');
    }

    // 2. 가이드라인 영상 찾기 및 Tools 업데이트
    const guidelineVideo = worksRes.results.find(p => p.properties.Name.title[0]?.plain_text === '가이드라인 영상');
    if (guidelineVideo) {
      // Claude ID 찾기 (교체 시 유지해야 하므로)
      const claudeId = toolsQuery.results.find(p => p.properties.Name.title[0]?.plain_text === 'Claude')?.id;
      
      const newTools = [];
      if (vrewId) newTools.push({ id: vrewId });
      if (claudeId) newTools.push({ id: claudeId });

      await notion.pages.update({
        page_id: guidelineVideo.id,
        properties: {
          'Related to Tools DB (Works)': { relation: newTools }
        }
      });
      console.log('가이드라인 영상: Canva 제거 및 Vrew 교체 완료');
    }

    console.log('\n--- 작업 2 검증: 가이드라인 영상 데이터 ---');
    const updatedWork = await notion.pages.retrieve({ page_id: guidelineVideo.id });
    const toolsInWork = updatedWork.properties['Related to Tools DB (Works)']?.relation?.length || 0;
    console.log(`가이드라인 영상 도구 개수: ${toolsInWork}개 (Vrew, Claude 예상)`);

    console.log('\n모든 작업이 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.log(JSON.stringify(error.body, null, 2));
  }
}

execute();
