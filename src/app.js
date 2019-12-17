const express = require("express");
const app = express();
const request = require("request");
const path = require("path");

app.use(express.static(path.join(__dirname, "../")));
app.set("view engine", "hbs");

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

let questionArray = [];
let correctAnsArray = [];

const getQuiz =
  ((catNum = ""),
  callback => {
    let quizURL = `https://opentdb.com/api.php?amount=10&type=multiple`;
    let catagorySetter = `&category=${catNum}`;

    // if (typeof catNum == "number"){

    //     quizURL = `https://opentdb.com/api.php?amount=10&type=multiple${catagorySetter}`;
    // }

    request(
      { url: quizURL, json: true, encoding: null },
      async (err, response) => {
        if (err) {
          console.log("ERROR: Cannot connect to API");
        } else if (response == undefined) {
          await callback({
            error: "Cannot find this catagory"
          });
        } else {
          // console.log(response);
          await callback(response.body);
        }
      }
    );
  });

let createQAndAPairs = data => {
  let answerArray = [];

  data.results.forEach((element, num) => {
    answerArray = element.incorrect_answers;
    answerArray.push(element.correct_answer);
    answerArray.forEach((e, key) => {
      answerArray[
        key
      ] = `<input type="radio" value="${e}" class="inputBtns" name="question${num +
        1}">${e}</input>`;
    });

    // console.log(answerArray);

    shuffle(answerArray);

    let object = {
      question: `<label for="question${num + 1}"><h3>${
        element.question
      }</h3></label>`,
      answers: answerArray
    };

    console.log(object);

    questionArray.push(object);
  });
};

const getAnswers = data => {
  data.results.forEach(element => {
    correctAnsArray.push(element.correct_answer);
  });
};

getQuiz(response => {
  createQAndAPairs(response);
  getAnswers(response);

  // console.log(questionArray);
});

console.log("this is it: ", questionArray.toString());

app.get("/index", (req, res) => {
  res.render("index", {
    data: questionArray
  });
});

app.listen(3001, () => {
  console.log("Server is running");
});
