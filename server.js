const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

var MongoClient = require("mongodb").MongoClient;

MongoClient.connect("mongodb://localhost:27017/questions", function(
  err,
  client
) {
  if (err) throw err;

  var db = client.db("questions");

  app.get("/qa/:product_id", (req, res) => {
    console.log(req.params);

    // should the promises be nested or one after another,
    // pushing results array into the data returned by the previous?
    db.collection("questions")
      .find({ product_id: Number(req.params.product_id) })
      .forEach(question => {
        console.log("QUESTION DATA: ", question);
        db.collection("answers")
          .find({ question_id: Number(question.id) })
          .forEach(answer => {
            db.collection("photos")
              .find({ answer_id: answer.id }, { url: 1, _id: 0 })
              .toArray((err, result) => {
                if (err) throw err;
                answer["photos"] = result;
                console.log(answer);
              });
          })
          .toArray((err, result) => {
            if (err) throw err;
            question["answers"] = result;
          });
      });

    // .toArray(function(err, result) {
    //   if (err) throw err;
    //   console.log(result);
    //   result.map(()=>{})
    //   res.send(result);
    // });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
