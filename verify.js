const { Client } = require('@notionhq/client');
require('dotenv').config();
const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03' });

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function verify() {
  console.log('--- Verification ---');
  
  // 1. Works & Categories Verification
  const worksRes = await notion.search({ query: 'Works DB' });
  const works = worksRes.results.find(r => r.object === 'data_source' && r.id.includes('fea19b77'));
  const worksItems = (await notion.request({ path: `data_sources/${works.id}/query`, method: 'post' })).results;
  
  console.log('Works DB Update Check:');
  worksItems.slice(0, 5).forEach(p => {
    const name = p.properties.Name.title[0].plain_text;
    const date = p.properties.Date?.date?.start;
    const tools = p.properties['Related to Tools DB (Works)']?.relation?.length || 0;
    const cat = p.properties.Category?.relation?.length || 0;
    console.log(`- ${name}: Date=${date}, ToolsCount=${tools}, CatLinked=${cat > 0}`);
  });

  // 2. About Page Check
  const mainChildren = await notion.blocks.children.list({ block_id: MAIN_PAGE_ID });
  const aboutPageBlock = mainChildren.results.find(b => b.type === 'child_page' && b.child_page.title === 'About');
  if (aboutPageBlock) {
    const aboutChildren = await notion.blocks.children.list({ block_id: aboutPageBlock.id });
    const bullets = aboutChildren.results.filter(b => b.type === 'bulleted_list_item');
    console.log('\nAbout Page Links Count:', bullets.length);
  }
}
verify().catch(console.error);
