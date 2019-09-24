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
            res.send(cleanUpData(returnObj));
          });
        })
        .catch(err => console.log(err));
    });

    app.get("/qa/:question_id/answers", (req, res) => {
      let page = req.params.page || 0;
      let count = req.params.count || 5;
      let question_id = req.params.question_id;
      let returnObj = {};
      returnObj["question_id"] = question_id;
      db.collection("answers")
        .find({ question_id: Number(question_id) })
        .limit(count)
        .skip(page * count)
        .toArray()
        .then(answers => {
          returnObj["answers"] = answers;
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
        .then(data => {
          res.send(returnObj);
        })
        .catch(err => {
          console.log(err);
        });
    });
    app.post("/qa/:product_id", (req, res) => {
      db.collection("questions")
        .count()
        .then(count => {
          db.collection("questions")
            .insertOne({
              id: count + 1,
              product_id: Number(req.params.product_id),
              body: req.body.body,
              date_written: new Date(),
              asker_name: req.body.name,
              asker_email: req.body.email,
              reported: 0,
              helpful: 0
            })
            .then(data => {
              res.sendStatus(201);
            })
            .catch(err => {
              console.log(err);
              res.sendStatus(500);
            });
        })
        .catch(err => {
          console.log("error: ", err);
          res.sendStatus(500);
        });
    });
    app.post("/qa/:question_id/answers", (req, res) => {
      db.collection("answers")
        .count()
        .then(count => {
          console.log("adding answer id #", count);
          console.log("question_id: ", req.params.question_id);
          db.collection("answers")
            .insertOne({
              id: count + 1,
              question_id: Number(req.params.question_id),
              body: req.body.body,
              date_written: new Date(),
              answerer_name: req.body.name,
              answerer_email: req.body.email,
              reported: 0,
              helpful: 0
            })
            .then(data => {
              let promises = [];
              req.body.photos.forEach(photo => {
                promises.push(
                  db.collection("photos").insertOne({
                    answer_id: count + 1,
                    url: photo
                  })
                );
              });
              Promise.all(promises).then(res.sendStatus(201));
            })
            .catch(err => {
              console.log(err);
              res.sendStatus(500);
            });
        })
        .catch(err => {
          console.log("error: ", err);
          res.sendStatus(500);
        });
    });
    app.put("/qa/question/:question_id/helpful", (req, res) => {
      console.log(req.params.question_id);
      db.collection("questions")
        .updateOne(
          { id: Number(req.params.question_id) },
          { $inc: { helpful: 1 } }
        )
        .then(data => {
          // why does it not send this status??
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });
    app.put("/qa/question/:question_id/report", (req, res) => {
      console.log(req.params.question_id);
      db.collection("questions")
        .updateOne(
          { id: Number(req.params.question_id) },
          { $inc: { reported: 1 } }
        )
        .then(data => {
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });
    app.put("/qa/answer/:answer_id/helpful", (req, res) => {
      db.collection("answers")
        .updateOne(
          { id: Number(req.params.answer_id) },
          { $inc: { helpful: 1 } }
        )
        .then(data => {
          // why does it not send this status??
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });
    app.put("/qa/answer/:answer_id/report", (req, res) => {
      db.collection("answers")
        .updateOne(
          { id: Number(req.params.answer_id) },
          { $inc: { reported: 1 } }
        )
        .then(data => {
          // why does it not send this status??
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
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
