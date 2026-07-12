require("dotenv").config();
const mysql = require("mysql2/promise");

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  console.log("Fixing Arabic payment settings...");

  const payments = [
    {
      method: "cash_on_delivery",
      displayNameAr: "الدفع عند الاستلام",
      instructionsAr: "ادفع نقدًا عند استلام طلبك.",
    },
    {
      method: "vodafone_cash",
      displayNameAr: "فودافون كاش",
      instructionsAr: "حوّل قيمة الطلب إلى رقم فودافون كاش الموضح، ثم أرسل صورة التحويل عبر واتساب لتأكيد الطلب.",
    },
    {
      method: "instapay",
      displayNameAr: "إنستاباي",
      instructionsAr: "حوّل قيمة الطلب عبر إنستاباي إلى الحساب الموضح، ثم أرسل صورة التحويل عبر واتساب لتأكيد الطلب.",
    },
    {
      method: "bank_transfer",
      displayNameAr: "تحويل بنكي",
      instructionsAr: "حوّل قيمة الطلب إلى الحساب البنكي الموضح، ثم أرسل إيصال التحويل لتأكيد الطلب.",
    },
  ];

  for (const p of payments) {
    await db.query(
      "UPDATE payment_settings SET display_name_ar = ?, instructions_ar = ? WHERE method = ?",
      [p.displayNameAr, p.instructionsAr, p.method]
    );
  }

  await db.end();
  console.log("Arabic payment settings fixed successfully.");
}

main().catch((err) => {
  console.error("Fix failed:");
  console.error(err.message);
  process.exit(1);
});