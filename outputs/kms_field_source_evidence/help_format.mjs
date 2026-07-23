import { Workbook } from "@oai/artifact-tool";

const workbook = Workbook.create();
console.log(workbook.help("range.format", {
  search: "fill|font|color|rowHeight|columnWidth|setSolidColor",
  include: "index,examples,notes",
  maxChars: 12000
}).ndjson);
