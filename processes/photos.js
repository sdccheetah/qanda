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
    .createReadStream("../../answers_photos.csv")
    .pipe(csv())
    .on("data", data => {
      results.push({
        photo_id: data.id,
        answer_id: data[" answer_id"],
        url: data[" url"]
      });
      count++;
      if (count === 10000) {
        model.Photo.insertMany(results);
        count = 0;
        results = [];
        insert++;
        console.log(insert);
      }
    })
    .on("end", () => {
      if (results.length > 0) model.Photo.insertMany(results);
      console.log("end of data");
    });
});
