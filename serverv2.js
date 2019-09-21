const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

var MongoClient = require("mongodb").MongoClient;

MongoClient.connect(
  "mongodb://localhost:27017/questions",
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    if (err) throw err;

    var db = client.db("questions");

    app.get("/qa/:product_id", (req, res) => {
      console.log(req.params);

      let returnObj = {};
      db.collection("questions")
        .find({ product_id: Number(req.params.product_id) })
        .toArray()
        .then(questions => {
          questions.forEach(question => {
            db.collection("answers")
              .find({ question_id: question.id })
              .toArray()
              .then(answers => {
                console.log("answers: ", answers);
                return answers.map(answer => {
                  return db
                    .collection("photos")
                    .find({ answer_id: answer.id })
                    .toArray()
                    .then(photoArray => {
                      answer["photos"] = photoArray;
                    });
                });
              })
              .then(answers => {
                return Promise.all(answers).then(answers => {
                  question["answers"] = answers;
                  console.log("question: ", question);
                });
              });
          });
        });
    });
  }
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
