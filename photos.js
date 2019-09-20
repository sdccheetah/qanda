var mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

mongoose.connect("mongodb://localhost:27017/questions", {
  useNewUrlParser: true
});

var db = mongoose.connection;

var Schema = mongoose.Schema;

const photoSchema = new Schema({
  id: Number,
  answer_id: { type: Number, index: true },
  url: String
});

var Photo = mongoose.model("Photo", photoSchema);
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded.");
  let results = [];
  let count = 0;
  let insert = 0;
  var lineReader = fs
    .createReadStream("../answers_photos.csv")
    .pipe(csv())
    .on("data", data => {
      results.push({
        id: data.id,
        answer_id: data[" answer_id"],
        url: data[" url"]
      });
      count++;
      if (count === 10000) {
        Photo.insertMany(results);
        count = 0;
        results = [];
        insert++;
        console.log(insert);
      }
    })
    .on("end", () => {
      Photo.insertMany(results);
      console.log("end of data");
    });
});
