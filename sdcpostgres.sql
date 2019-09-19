DROP DATABASE IF EXISTS qanda;

CREATE DATABASE qanda;
USE qanda;
CREATE TABLE questions(
  id int NOT NULL AUTO_INCREMENT,
  product_id int,
  question_body VARCHAR(1000), 
  question_date DATE,
  asker_name VARCHAR(60),
  asker_email VARCHAR(60),
  question_helpfulness INT,
  reported INT,
  PRIMARY KEY(id)
);

CREATE TABLE answers(
  id INT NOT NULL AUTO_INCREMENT,
  question_id INT,
  body VARCHAR(1000),
  answer_date DATE,
  answerer_email VARCHAR(60),
  answerer_name VARCHAR(60),
  answer_helpfulness INT,
  reported INT,
  PRIMARY KEY(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE photos(
  id INT NOT NULL AUTO_INCREMENT,
  photo_url VARCHAR(1000),
  answer_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (answer_id) REFERENCES answers(id)
);