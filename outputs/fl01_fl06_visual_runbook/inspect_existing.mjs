import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl04_visual_runbook/KMS_FL01_FL04_Visual_Runbook_Tieng_Viet.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 9000,
  tableMaxRows: 8,
  tableMaxCols: 8,
  tableMaxCellChars: 90
});
console.log(overview.ndjson);
