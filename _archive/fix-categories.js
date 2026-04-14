const { Client } = require('@notionhq/client');
require('dotenv').config();
const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03' });

const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const CATEGORY_DB_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';

// 매핑 데이터
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

async function fixCategories() {
  try {
    console.log('--- 카테고리 복구 작업 시작 ---');

    // 1. 카테고리 ID 맵핑 (이름 -> ID)
    const catsSearch = await notion.search({ query: 'Category DB' });
    const catsDS = catsSearch.results.find(r => r.object === 'data_source' && r.id.includes('d42bef2b'));
    const catItems = (await notion.request({ path: `data_sources/${catsDS.id}/query`, method: 'post' })).results;
    
    const catMap = {};
    catItems.forEach(p => {
      const name = p.properties.Name.title[0]?.plain_text;
      if (name) catMap[name] = p.id;
    });
    console.log('카테고리 맵 생성 완료');

    // 2. Works DB 조회
    const worksSearch = await notion.search({ query: 'Works DB' });
    const worksDS = worksSearch.results.find(r => r.object === 'data_source' && r.id.includes('fea19b77'));
    const worksItems = (await notion.request({ path: `data_sources/${worksDS.id}/query`, method: 'post' })).results;
    
    console.log(`Works DB 총 ${worksItems.length}개 항목 검사 중...`);

    for (const work of worksItems) {
      const title = work.properties.Name.title[0]?.plain_text;
      const currentCatId = work.properties.Category?.relation[0]?.id;

      if (!currentCatId) {
        const targetCatName = mapping[title];
        const targetCatId = catMap[targetCatName];

        if (targetCatId) {
          await notion.pages.update({
            page_id: work.id,
            properties: {
              'Category': { relation: [{ id: targetCatId }] }
            }
          });
          console.log(`[연결됨] ${title} -> ${targetCatName}`);
        } else {
          console.warn(`[주의] ${title}에 대한 카테고리(${targetCatName})를 찾을 수 없습니다.`);
        }
      } else {
        console.log(`[확인] ${title} 이미 연결됨`);
      }
    }

    // 3. Category DB Count 확인
    console.log('\n--- 최종 결과 확인 ---');
    const finalCatItems = (await notion.request({ path: `data_sources/${catsDS.id}/query`, method: 'post' })).results;
    
    for (const cat of finalCatItems) {
      const name = cat.properties.Name.title[0]?.plain_text;
      // Count 롤업은 API로 즉시 반영된 값을 가져오기 어려울 수 있어 relation 수를 직접 셉니다.
      const relationCount = cat.properties['Works']?.relation?.length || 0;
      console.log(`- ${name}: 연결된 작업물 수 = ${relationCount}`);
    }

    console.log('\n작업이 완료되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

fixCategories();
