const parse = require("csv-parse");
const parser = parse("1,2,3\na,b,c");
// Using a function declaration
parser.on("./shortquestions.csv", function() {
  while (let record = this.read()) {
    const { lines, records } = this.info;
    console.info(`Current state is ${lines} lines and ${records} records.`);
  }
});
// Using a fat arrow
parser.on("end", () => {
  const { lines, records } = parser.info;
  console.info(`There are ${lines} lines with ${records} records.`);
});
