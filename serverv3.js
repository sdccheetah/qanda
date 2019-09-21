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
      returnObj["product_id"] = req.params.product_id;
      db.collection("questions")
        .find({ product_id: Number(req.params.product_id) })
        .toArray()
        .then(questions => {
          returnObj["results"] = questions;
          let innerPromises;
          let promises = returnObj["results"].map(question => {
            return db
              .collection("answers")
              .find({ question_id: question.id })
              .toArray()
              .then(answers => {
                question["answers"] = answers;
                innerPromises = answers.map(answer => {
                  return db
                    .collection("photos")
                    .find({ answer_id: answer.id })
                    .toArray()
                    .then(photos => {
                      answer["photos"] = photos;
                    })
                    .catch(err => console.log(err));
                });
                return Promise.all(innerPromises);
              })
              .catch(err => {
                console.log(err);
              });
          });
          Promise.all(promises).then(() => {
            console.log("returnObj", returnObj);
            res.send(cleanUpData(returnObj));
          });
        })
        .catch(err => console.log(err));
    });
  }
);

cleanUpData = obj => {
  for (let i = 0; i < obj.results.length; i++) {
    let question = obj.results[i];
    if (question.reported === 1) obj.results.splice(i, 1);
    else {
      delete question["_id"];
      delete question["__v"];
      question["question_id"] = question["id"];
      delete question["id"];
    }
  }
  return obj;
};

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
