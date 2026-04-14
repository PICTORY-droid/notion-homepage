const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CATEGORY_DB_ID = "9fb48552-32b5-4909-b710-4c0b27ae7cfb";
const TOOLS_DB_ID = "4d5e33aa-7540-4fed-af3f-dd8cdb913c49";

const categories = [
  "카드뉴스 & 홍보물",
  "교육 템플릿",
  "AI 이미지 & 애니메이션",
  "앱 & 랜딩페이지",
  "노션 템플릿",
];

const tools = [
  "Canva",
  "Claude",
  "Notion",
  "GitHub",
  "Vercel",
  "구글 스프레드시트",
];

async function seed() {
  console.log("🌱 기본 데이터 넣기 시작...");

  // 카테고리 추가
  console.log("\n📁 카테고리 추가 중...");
  for (const name of categories) {
    await notion.pages.create({
      parent: { database_id: CATEGORY_DB_ID },
      properties: {
        Name: { title: [{ text: { content: name } }] },
      },
    });
    console.log("  ✅", name);
  }

  // 툴 추가
  console.log("\n🔧 툴 추가 중...");
  for (const name of tools) {
    await notion.pages.create({
      parent: { database_id: TOOLS_DB_ID },
      properties: {
        Name: { title: [{ text: { content: name } }] },
      },
    });
    console.log("  ✅", name);
  }

  console.log("\n🎉 기본 데이터 모두 추가 완료!");
}

seed().catch((err) => {
  console.error("❌ 오류 발생:", err.message);
});
