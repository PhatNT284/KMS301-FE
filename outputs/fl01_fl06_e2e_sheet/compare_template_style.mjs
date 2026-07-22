import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outDir = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl06_e2e_sheet";
const templatePath = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl04_visual_runbook/KMS_FL01_FL04_Visual_Runbook_Tieng_Viet.xlsx";
const currentPath = `${outDir}/KMS_FL01_FL06_End_to_End_Demo_Sheet_Tieng_Viet.xlsx`;

async function load(path) {
  return SpreadsheetFile.importXlsx(await FileBlob.load(path));
}

async function render(workbook, sheetName, fileName, range = "A1:H18") {
  const blob = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${outDir}/${fileName}`, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(outDir, { recursive: true });

const template = await load(templatePath);
const current = await load(currentPath);

const templateInspect = await template.inspect({
  kind: "workbook,sheet,table,computedStyle",
  sheetId: "00_Cách dùng",
  range: "A1:H12",
  maxChars: 9000,
  tableMaxRows: 8,
  tableMaxCols: 8,
  tableMaxCellChars: 120
});
await fs.writeFile(`${outDir}/template_style_inspect.ndjson`, templateInspect.ndjson, "utf8");

const currentInspect = await current.inspect({
  kind: "workbook,sheet,table,computedStyle",
  sheetId: "01_E2E_Master",
  range: "A1:H18",
  maxChars: 9000,
  tableMaxRows: 8,
  tableMaxCols: 8,
  tableMaxCellChars: 120
});
await fs.writeFile(`${outDir}/current_style_inspect.ndjson`, currentInspect.ndjson, "utf8");

await render(template, "00_Cách dùng", "template_preview_00_Cach_dung.png", "A1:H12");
await render(template, "01_FL01", "template_preview_01_FL01.png", "A1:H18");
await render(current, "01_E2E_Master", "current_preview_01_E2E_Master.png", "A1:H20");
await render(current, "01_FL01", "current_preview_01_FL01.png", "A1:H18");

console.log("Rendered template/current previews and inspect files.");
