var mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const model = require("../model.js");

model.db.on("error", console.error.bind(console, "connection error"));
model.db.once("open", function(callback) {
  console.log("Connection succeeded.");
  let results = [];
  let count = 0;
  let insert = 0;
  var lineReader = fs
    .createReadStream("../../answers.csv")
    .pipe(csv())
    .on("data", data => {
      results.push({
        id: data.id,
        question_id: data[" question_id"],
        body: data[" body"],
        date: data[" date_written"],
        answerer_name: data[" answerer_name"],
        answerer_email: data[" answerer_email"],
        reported: data[" reported"],
        helpfulness: data[" helpful"]
      });
      count++;
      if (count === 10000) {
        model.Answer.insertMany(results);
        count = 0;
        results = [];
        insert++;
        console.log(insert);
      }
    })
    .on("end", () => {
      if (results.length > 0) model.Answer.insertMany(results);
      console.log("end of data");
    });
});
