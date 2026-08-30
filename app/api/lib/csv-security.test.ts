import { expect, it } from "vitest";
import { toCsv } from "./admin-utils";

it.each(["=1+1", "+1+1", "-1+1", "@SUM(1)", "\t=1", "\r\n=1"])("neutralizes spreadsheet formulas: %s", value => {
  expect(toCsv([{ value }])).toContain(`"'${value}"`);
});
it("preserves numbers, Arabic and quotes", () => {
  expect(toCsv([{ name: 'منتج "جديد"', amount: -2 }])).toBe('"name","amount"\n"منتج ""جديد""","-2"');
});
