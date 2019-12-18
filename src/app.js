const express = require("express");
const app = express();
const session = require('express-session')
const request = require('request');
const path = require('path');
const mysql = require('mysql')


app.use(express.static(path.join(__dirname, "../")));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded());
app.use(express.json());

app.set("view engine", "hbs");

const db = mysql.createConnection({
  // info in 'session' tab
  host: "127.0.0.1", // in Workbench
  user: "root",
  password: "password",
  port: 3306, //mySQL port
  database: "scoreLog"
});

db.connect(err => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQLBlog Connected");
  }
});

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

let questionArray = [];
let correctAnsArray = [];
let score = 0;
let userAnswers;
let data;

const getQuiz =
  ((catNum = ""),
  callback => {
    let quizURL = `https://opentdb.com/api.php?amount=10&type=multiple`;
    // let catagorySetter = `&category=${catNum}`

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
    let correctA = `<input type="radio" value="${
      element.correct_answer
    }" class="inputBtns correct" name="question${num + 1}">${
      element.correct_answer
    }</input>`;
    answerArray = element.incorrect_answers;
    answerArray.forEach((e, key) => {
      answerArray[
        key
      ] = `<input type="radio" value="${e}" class="inputBtns" name="question${num +
        1}">${e}</input>`;
    });

    answerArray.push(correctA);

    // console.log(answerArray);

    shuffle(answerArray);

    let object = {
      question: `<label for="question${num + 1}"><h3>${
        element.question
      }</h3></label>`,
      answers: answerArray
    };

    // console.log(object);

    questionArray.push(object);
  });
};

const getAnswers = data => {
  data.results.forEach(element => {
    correctAnsArray.push(element.correct_answer);
  });
  console.log(correctAnsArray);
};


app.get('/scoreRead', (req, res) => {
    
    if (req.session.loggedin) {
        

        res.render('scoreRead', {
            score: score,
            data: questionArray

        })

    } else {
		res.send('Please login to view this page!');
	}
	// response.end();
})

app.post('/scoreRead', (req, res) => {
    
    if (req.session.loggedin) {
        userAnswers = Object.values(req.body);
        userAnswers.forEach(element => {
            if (correctAnsArray.includes(element)) {
                score ++
            }
        })

        res.render('scoreRead', {
            score: score,
            data: questionArray

        })

        score=0;
    } else {
		res.send('Please login to view this page!');
	}
	// response.end();
})


// console.log("this is it: ", questionArray.toString());ß

app.get('/index', (req, res) => {
    if (req.session.loggedin) { 

        res.render('index', {
            userName: req.body.theUserName,
            data: questionArray

        })

    
    } else {
        res.send('Please login to view this page!');
    }


  // console.log(score);
});

});


app.get('/auth', (req, res) => {
    if (req.session.loggedin) { 
    
        res.render('auth')

    } else {
        res.send('Please login to view this page!');
    }


});

app.get("/highscore", (req, res) => {
  res.render("highscore", {});
});

app.get("/", (request, response) => {
  response.render("login");
});

app.post("/index", (request, response) => {
  const userName = request.body.theUserName;
  const password = request.body.thePassword;
  let sqlCheck =
    "SELECT user_name, user_password FROM users WHERE user_name = ?";

  db.query(sqlCheck, userName, (error, result) => {
    if (error) {
      console.log("[INFO] Error");
      console.log(error);
    } else {
      if (result.length < 1) {
        response.render("errorLogin");
      } else {
        response.render("index", {
          data: questionArray,
          userName: userName
        });
      }
    }
  });
});

app.get('/', (request, response) => {
    
    response.render('login')
}); 

app.post('/auth', function(request, response) {
    console.log(request.body);
    
    var username = request.body.theUserName;
    console.log(username);
    
    var password = request.body.thePassword;
    console.log(password);

	if (username && password) {
		db.query('SELECT * FROM users WHERE user_name = ? AND user_password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                response.redirect('/index'); 
			} else {
				response.redirect('auth') 
			}			
			response.end();
		});
	} else {
        response.redirect('auth') 		
		response.end();
	}
});

// app.post('/index', (request, response) => {
//     const userName = request.body.theUserName; 
//     const password = request.body.thePassword;
//     let sqlCheck = 'SELECT user_name, user_password FROM users WHERE user_name = ?';

//     db.query(sqlCheck, userName, (error, result) => {
//         if(error) {
//             console.log('[INFO] Error')
//             console.log(error) 
//         } else {
//             if(result.length < 1){
//                response.render('errorLogin') 
//             } else {
//                 response.render('index', {                       
//                     data: questionArray, 
//                     userName: userName
//                 }) 
//             }
//         }
//     })  
// });  

app.get('/register', (request, response) => {
    response.render('register')
});

app.listen(3001, () => {
  console.log("Server is running");
});
