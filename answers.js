var mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

mongoose.connect("mongodb://localhost:27017/questions2", {
  useNewUrlParser: true
});

var db = mongoose.connection;

var Schema = mongoose.Schema;

const answerSchema = new Schema({
  id: { type: Number, unique: true },
  question_id: { type: Number, index: true },
  body: String,
  date: Date,
  answerer_name: String,
  answerer_email: String,
  reported: Number,
  helpfulness: Number
});

var Answer = mongoose.model("Answer", answerSchema);
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded.");
  let results = [];
  let count = 0;
  let insert = 0;
  var lineReader = fs
    .createReadStream("../answers.csv")
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
        Answer.insertMany(results);
        count = 0;
        results = [];
        insert++;
        console.log(insert);
      }
    })
    .on("end", () => {
      if (results.length > 0) Answer.insertMany(results);
      console.log("end of data");
    });
});
