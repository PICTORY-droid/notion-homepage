const { Client } = require('@notionhq/client');
require('dotenv').config();
const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03' });

const MAIN_PAGE_ID = '341d597ef70780adb899c21257212013';

async function step3() {
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
    console.log('Added links to About page.');
  }
}
step3().catch(console.error);
