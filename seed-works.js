const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2025-09-03'
});

const WORKS_DB_ID = '93f46e0d-2634-46e8-87fb-c26da9202a72';
const CATEGORY_DB_DATA_SOURCE_ID = 'd42bef2b-5e41-4bad-b474-059a0aafb9e3';

const worksData = [
  { title: '전자책', category: '출판 & 콘텐츠', link: 'https://notefolio.net/_Pictory/451056' },
  { title: '발매 음원', category: '음악', link: 'https://www.melon.com/album/detail.htm?albumId=12411323' },
  { title: '결혼식 노트', category: '출판 & 콘텐츠', link: 'https://www.amazon.com/dp/B0CHMBWN4X' },
  { title: '색칠북', category: '출판 & 콘텐츠', link: 'https://www.yes24.com/product/goods/140375062' },
  { title: '네일 판촉', category: '디자인', link: 'https://notefolio.net/_Pictory/collection/94191' },
  { title: 'IT 트렌드 포스터', category: '디자인', link: 'https://notefolio.net/_Pictory/451053' },
  { title: '명언 템플릿', category: '디자인', link: 'https://notefolio.net/_Pictory/439923' },
  { title: 'AI 모션시트', category: 'AI 크리에이티브', link: 'https://notefolio.net/_Pictory/collection/94207' },
  { title: '카드 UI', category: '디자인', link: 'https://notefolio.net/_Pictory/440237' },
  { title: '가이드라인 영상', category: '디자인', link: 'https://notefolio.net/_Pictory/433995' }
];

async function seedWorks() {
  try {
    console.log('카테고리 ID 맵 생성 중...');
    const catRes = await notion.dataSources.query({ data_source_id: CATEGORY_DB_DATA_SOURCE_ID });
    const categoryMap = {};
    catRes.results.forEach(p => {
      const name = p.properties.Name.title[0].plain_text;
      categoryMap[name] = p.id;
    });

    console.log('작업물 추가 중...');
    for (const work of worksData) {
      const categoryId = categoryMap[work.category];
      if (!categoryId) {
        console.warn(`  경고: '${work.category}' 카테고리를 찾을 수 없습니다. (${work.title})`);
        continue;
      }

      await notion.pages.create({
        parent: { database_id: WORKS_DB_ID },
        properties: {
          'Name': {
            title: [{ text: { content: work.title } }]
          },
          'Category': {
            relation: [{ id: categoryId }]
          },
          'Link': {
            url: work.link
          }
        }
      });
      console.log(`  추가 완료: ${work.title}`);
    }

    console.log('모든 작업물 추가 완료!');
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.body) console.error(JSON.stringify(error.body, null, 2));
  }
}

seedWorks();
