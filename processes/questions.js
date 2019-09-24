var mongoose = require("mongoose");
const fs = require("fs");
const readline = require("readline");
const csv = require("csv-parser");
const model = require("../model.js");

model.db.on("error", console.error.bind(console, "connection error"));
model.db.once("open", function(callback) {
  console.log("Connection succeeded.");
  let results = [];
  let count = 0;
  let insert = 0;
  var lineReader = fs
    .createReadStream("../../questions.csv")
    .pipe(csv())
    .on("data", data => {
      results.push({
        question_id: data.id,
        product_id: data[" product_id"],
        question_body: data[" body"],
        question_date: data[" date_written"],
        asker_name: data[" asker_name"],
        asker_email: data[" asker_email"],
        reported: data[" reported"],
        question_helpfulness: data[" helpful"]
      });
      count++;
      if (count === 10000) {
        model.Question.insertMany(results);
        count = 0;
        results = [];
        insert++;
        console.log(insert);
      }
    })
    .on("end", () => {
      if (results.length > 0) model.Question.insertMany(results);
      console.log("questions inserted");
    });
});

// lineReader.on("line", function(line) {
//   console.log("Line from file:", csv(line));
//   // let data = line.split(",");
// let q = new Question({
//   id: data[0],
//   product_id: data[1],
//   question_body: data[2],
//   question_date: data[3],
//   asker_name: data[4],
//   asker_email: data[5],
//   question_helpfulness: data[6],
//   reported: data[7]
// });
// q.save(function(error) {
//   console.log("Your question has been saved!");
//   if (error) {
//     console.error(error);
//   }
// });
// });
// });

// const stream = fs.createReadStream('../questions.csv');
// setTimeout(() => {
//   stream.close(); // This may not close the stream.
//   // Artificially marking end-of-stream, as if the underlying resource had
//   // indicated end-of-file by itself, allows the stream to close.
//   // This does not cancel pending read operations, and if there is such an
//   // operation, the process may still not be able to exit successfully
//   // until it finishes.
//   stream.push(null);
//   stream.read(0);
// }, 100);

// var first = new Question({
//   id: 6,
//   product_id: 2
// });

// first.save(function(error) {
//   console.log("Your question has been saved!");
//   if (error) {
//     console.error(error);
//   }
// });

// const mongoose = require("mongoose");
// let Schema = mongoose.schema;

// // mongoose.connect("mongodb://localhost/myTestDB", { useNewUrlParser: true });

// // const db = mongoose.connection;
// // db.on("error", function(err) {
// //   console.log("connection error", err);
// // });
// // db.once("open", function() {
// //   console.log("connected.");
// // });

// let questionsSchema = new Schema({
//   product_id: Number,
//   results: Number
//   // results: [
//   //   {
//   //     question_id: Number,
//   //     question_body: String,
//   //     question_date: Date,
//   //     asker_name: String,
//   //     asker_email: String,
//   //     question_helpfulness: Number,
//   //     reported: Number
//   //   }
//   // ]
// });

// let Questions = mongoose.model("Questions", questionsSchema);

// var first = new Questions({ product_id: 5, results: 4 });

// // answers: [
// //   {
// //     answer_id: Number,
// //     answer_body: String,
// //     answer_date: Date,
// //     answerer_name: String,
// //     answerer_email: String,
// //     answer_helpfulness: Number,
// //     reported: Number,
// //     photos: Array
// //   }
// // ]
