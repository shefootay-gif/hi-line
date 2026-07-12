require("dotenv").config();
const mysql = require("mysql2/promise");

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  console.log("Fixing Arabic shipping governorates...");

  const governorates = [
    ["Cairo", "القاهرة"],
    ["Giza", "الجيزة"],
    ["Alexandria", "الإسكندرية"],
    ["Dakahlia", "الدقهلية"],
    ["Red Sea", "البحر الأحمر"],
    ["Beheira", "البحيرة"],
    ["Fayoum", "الفيوم"],
    ["Gharbia", "الغربية"],
    ["Ismailia", "الإسماعيلية"],
    ["Menofia", "المنوفية"],
    ["Minya", "المنيا"],
    ["Qaliubiya", "القليوبية"],
    ["New Valley", "الوادي الجديد"],
    ["Suez", "السويس"],
    ["Aswan", "أسوان"],
    ["Assiut", "أسيوط"],
    ["Beni Suef", "بني سويف"],
    ["Port Said", "بورسعيد"],
    ["Damietta", "دمياط"],
    ["Sharkia", "الشرقية"],
    ["South Sinai", "جنوب سيناء"],
    ["Kafr El Sheikh", "كفر الشيخ"],
    ["Matrouh", "مطروح"],
    ["Luxor", "الأقصر"],
    ["Qena", "قنا"],
    ["North Sinai", "شمال سيناء"],
    ["Sohag", "سوهاج"],
  ];

  for (const [governorate, governorateAr] of governorates) {
    await db.query(
      "UPDATE shipping_settings SET governorate_ar = ? WHERE governorate = ?",
      [governorateAr, governorate]
    );
  }

  await db.end();
  console.log("Arabic shipping governorates fixed successfully.");
}

main().catch((err) => {
  console.error("Fix failed:");
  console.error(err.message);
  process.exit(1);
});