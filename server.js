const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const model = require("./model.js");

app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;

MongoClient.connect(
  "mongodb://localhost:27017/questions2",
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    if (err) throw err;

    const db = client.db("questions2");

    app.get("/qa/:product_id", (req, res) => {
      let returnObj = {};
      returnObj["product_id"] = req.params.product_id;
      db.collection("questions")
        .find({ product_id: Number(req.params.product_id) })
        .project({
          _id: 0,
          question_id: 1,
          question_body: 1,
          question_date: 1,
          asker_name: 1,
          question_helpfulness: 1,
          reported: 1
        })
        .toArray()
        .then(questions => {
          returnObj["results"] = questions;
          let innerPromises;
          let promises = returnObj["results"].map(question => {
            let questionId = Number(question.question_id);
            return db
              .collection("answers")
              .find({ question_id: questionId })
              .project({
                _id: 0,
                id: 1,
                body: 1,
                date: 1,
                answerer_name: 1,
                helpfulness: 1
              })
              .toArray()
              .then(answers => {
                question["answers"] = {};
                innerPromises = answers.map(answer => {
                  return db
                    .collection("photos")
                    .find({ answer_id: answer.id })
                    .project({
                      _id: 0,
                      url: 1
                    })
                    .toArray()
                    .then(photos => {
                      photos = photos.map(photo => photo.url);
                      question["answers"][answer.id] = answer;
                      question["answers"][answer.id].photos = photos;
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
            res.send(returnObj);
          });
        })
        .catch(err => console.log(err));
    });

    app.get("/qa/:question_id/answers", (req, res) => {
      let page = Number(req.query.page) || 0;
      let count = Number(req.query.count) || 5;
      let question_id = req.params.question_id;
      let returnObj = {};
      returnObj["question"] = question_id;
      returnObj["page"] = page;
      returnObj["count"] = count;
      db.collection("answers")
        .find({ question_id: Number(question_id) })
        .project({
          _id: 0,
          id: 1,
          body: 1,
          date: 1,
          answerer_name: 1,
          helpfulness: 1
        })
        .limit(count)
        .skip(page * count)
        .toArray()
        .then(answers => {
          returnObj["results"] = answers.map(answer => {
            answer["answer_id"] = answer["id"];
            delete answer["id"];
            return answer;
          });
          innerPromises = answers.map(answer => {
            return db
              .collection("photos")
              .find({ answer_id: answer.answer_id })
              .toArray()
              .then(photos => {
                answer["photos"] = photos.map(photo => photo.url);
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
          model.Question.create(
            {
              question_id: count + 1,
              product_id: Number(req.params.product_id),
              question_body: req.body.body,
              question_date: new Date(),
              asker_name: req.body.name,
              asker_email: req.body.email,
              reported: 0,
              question_helpfulness: 0
            },
            function(err, data) {
              if (err) {
                console.log(err);
                res.sendStatus(500);
              } else res.sendStatus(201);
            }
          );
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
          db.collection("answers")
            .insertOne({
              id: count + 1,
              question_id: Number(req.params.question_id),
              body: req.body.body,
              date_written: new Date(),
              answerer_name: req.body.name,
              answerer_email: req.body.email,
              reported: 0,
              helpfulness: 0
            })
            .then(data => {
              if (req.body.photos) {
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
              } else res.sendStatus(201);
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
      db.collection("questions")
        .updateOne(
          { question_id: Number(req.params.question_id) },
          { $inc: { question_helpfulness: 1 } }
        )
        .then(data => {
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });

    app.put("/qa/question/:question_id/report", (req, res) => {
      db.collection("questions")
        .updateOne(
          { question_id: Number(req.params.question_id) },
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
          { $inc: { helpfulness: 1 } }
        )
        .then(data => {
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
          res.sendStatus(204);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });
  }
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
