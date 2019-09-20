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
    db.collection("questions")
      .find({ product_id: Number(req.params.product_id) })
      .forEach(question => {
        db.collection("answers")
          .find({ question_id: Number(question.id) })
          .forEach(answer => {
            db.collection("photos")
              .find({ answer_id: answer.id })
              .toArray((err, result) => {
                if (err) throw err;
                answer["photos"] = result;
                delete answer["photos"]._id;
                delete answer["photos"].answer_id;
                console.log(answer);
              });
          });
      });
    res.sendStatus(200);
    // .toArray(function(err, result) {
    //   if (err) throw err;
    //   console.log(result);
    //   result.map(()=>{})
    //   res.send(result);
    // });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
