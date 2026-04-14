const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = '9fb48552-32b5-4909-b710-4c0b27ae7cfb';

const NEW_CATEGORIES = [
  '디자인',
  'AI 크리에이티브',
  '출판 & 콘텐츠',
  '음악',
  '앱 & 개발',
  '노션 템플릿'
];

async function resetCategories() {
  try {
    console.log('Category DB 정보 찾는 중...');
    const searchRes = await notion.search({ query: 'Category DB' });
    const dataSource = searchRes.results.find(res => res.object === 'data_source' && res.parent?.database_id === DATABASE_ID);
    
    if (!dataSource) {
      throw new Error('해당 Database ID와 연결된 Data Source를 찾을 수 없습니다.');
    }

    const dataSourceId = dataSource.id;
    console.log(`Data Source ID 확인: ${dataSourceId}`);

    console.log('기존 항목 삭제 중...');
    const queryRes = await notion.dataSources.query({ data_source_id: dataSourceId });
    
    for (const page of queryRes.results) {
      await notion.pages.update({ page_id: page.id, in_trash: true });
      const name = page.properties?.Name?.title?.[0]?.plain_text || page.id;
      console.log(`  삭제: ${name}`);
    }

    console.log('새 카테고리 추가 중...');
    for (const name of NEW_CATEGORIES) {
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: name } }]
          }
        }
      });
      console.log(`  추가: ${name}`);
    }

    console.log('카테고리 초기화 완료!');
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) {
      console.error('상세 내용:', JSON.stringify(error.body, null, 2));
    }
  }
}

resetCategories();
