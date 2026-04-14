const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PAGE_ID = process.env.NOTION_PAGE_ID;

async function setup() {
  console.log("🚀 Notion 홈페이지 DB 생성 시작...");

  // 1. Category DB 생성
  console.log("📁 Category DB 생성 중...");
  const categoryDB = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Category DB" } }],
    properties: {
      Name: { title: {} },
    },
  });
  console.log("✅ Category DB 생성 완료:", categoryDB.id);

  // 2. Tools DB 생성
  console.log("🔧 Tools DB 생성 중...");
  const toolsDB = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Tools DB" } }],
    properties: {
      Name: { title: {} },
    },
  });
  console.log("✅ Tools DB 생성 완료:", toolsDB.id);

  // 3. Works DB 생성
  console.log("🗂 Works DB 생성 중...");
  const worksDB = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Works DB" } }],
    properties: {
      Name: { title: {} },
      Category: { relation: { database_id: categoryDB.id, single_property: {} } },
      Tools: { relation: { database_id: toolsDB.id, single_property: {} } },
      Link: { url: {} },
      Date: { date: {} },
      Status: {
        select: {
          options: [
            { name: "공개", color: "green" },
            { name: "비공개", color: "gray" },
          ],
        },
      },
    },
  });
  console.log("✅ Works DB 생성 완료:", worksDB.id);

  // 4. Inquiry DB 생성
  console.log("📬 Inquiry DB 생성 중...");
  const inquiryDB = await notion.databases.create({
    parent: { type: "page_id", page_id: PAGE_ID },
    title: [{ type: "text", text: { content: "Inquiry DB" } }],
    properties: {
      Name: { title: {} },
      Email: { email: {} },
      Message: { rich_text: {} },
      Date: { created_time: {} },
      Works: { relation: { database_id: worksDB.id, single_property: {} } },
    },
  });
  console.log("✅ Inquiry DB 생성 완료:", inquiryDB.id);

  console.log("");
  console.log("🎉 모든 DB 생성 완료!");
  console.log("📋 생성된 DB ID 목록:");
  console.log("  Category DB:", categoryDB.id);
  console.log("  Tools DB:", toolsDB.id);
  console.log("  Works DB:", worksDB.id);
  console.log("  Inquiry DB:", inquiryDB.id);
}

setup().catch((err) => {
  console.error("❌ 오류 발생:", err.message);
});
