import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputPath = "/Users/macprocuaphat/Desktop/KMS301/Code/FE/outputs/fl01_fl06_visual_runbook/KMS_FL01_FL06_Visual_Runbook_Tieng_Viet.xlsx";
const input = await FileBlob.load(outputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const checks = [
  { sheetId: "05_FL05", range: "A1:H18" },
  { sheetId: "06_FL06", range: "A1:H22" },
  { sheetId: "07_Data_Demo", range: "A1:H26" },
  { sheetId: "08_Checklist", range: "A1:H22" }
];

for (const check of checks) {
  const table = await workbook.inspect({
    kind: "table",
    sheetId: check.sheetId,
    range: check.range,
    include: "values,formulas",
    tableMaxRows: 8,
    tableMaxCols: 8,
    tableMaxCellChars: 100
  });
  console.log(table.ndjson);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final exported workbook formula error scan"
});
console.log(errors.ndjson);
