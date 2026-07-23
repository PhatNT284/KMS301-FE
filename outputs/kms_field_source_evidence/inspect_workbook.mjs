import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/documents/DataDemo_KMS.xlsx";
const outputDir = "/Users/phantatthanh/Documents/FPT-Sem7/KMS301/KMS301-FE/outputs/kms_field_source_evidence";

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 9000,
  tableMaxRows: 6,
  tableMaxCols: 8,
  tableMaxCellChars: 90
});

await fs.writeFile(`${outputDir}/inspect.ndjson`, summary.ndjson, "utf8");

const firstSheet = workbook.worksheets.getItemAt(0).name;
const preview = await workbook.render({ sheetName: firstSheet, autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(`${outputDir}/preview_before.png`, new Uint8Array(await preview.arrayBuffer()));

console.log(summary.ndjson);
console.log(`Rendered ${firstSheet}`);
