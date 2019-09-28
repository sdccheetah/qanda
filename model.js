var mongoose = require("mongoose");

mongoose.connect("mongodb://host.docker.internal:27017/questions", {
  useNewUrlParser: true
});

module.exports.db = mongoose.connection;

var Schema = mongoose.Schema;

var questionSchema = new Schema({
  question_id: { type: Number, unique: true },
  product_id: { type: Number, index: true },
  question_body: String,
  question_date: Date,
  asker_name: String,
  asker_email: String,
  reported: Number,
  question_helpfulness: Number
});

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

const photoSchema = new Schema({
  id: Number,
  answer_id: { type: Number, index: true },
  url: String
});

module.exports.Photo = mongoose.model("Photo", photoSchema);

module.exports.Answer = mongoose.model("Answer", answerSchema);

module.exports.Question = mongoose.model("Question", questionSchema);
