const express =  require('express');
const app = express();
const request = require('request');
const path = require('path');
const mysql = require('mysql')

app.use(express.static(path.join(__dirname, '../')));

app.use(express.urlencoded());
app.use(express.json());

app.set('view engine', 'hbs');

const db = mysql.createConnection({         // info in 'session' tab
    host:'127.0.0.1',                       // in Workbench
    user: 'root',
    password: 'password',
    port: 3306,             //mySQL port
    database: 'scoreLog'
});

db.connect((err) => {
    if(err) {
        console.log(err); 
    } else{
        console.log('MySQLBlog Connected');  
    }
})

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}  

let questionArray = [];
let correctAnsArray = [];
let score = 0;
let userAnswers;
let data;

const getQuiz = (catNum = "", (callback)=>{


    let quizURL = `https://opentdb.com/api.php?amount=10&type=multiple`;
    // let catagorySetter = `&category=${catNum}`

    // if (typeof catNum == "number"){
        
    //     quizURL = `https://opentdb.com/api.php?amount=10&type=multiple${catagorySetter}`;
    // } 

    request({url: quizURL, json:true, encoding:null}, async (err, response )=> {
        
        if(err){

            console.log("ERROR: Cannot connect to API");
            
        }else if(response == undefined){

            await callback({
                error: "Cannot find this catagory"
            });
        }
        else{
            // console.log(response);
            await callback(response.body);
       }
      
    })
})

let createQAndAPairs = (data)=> {

    let answerArray = []

    data.results.forEach((element, num) => {
        let correctA = `<input type="radio" value="${element.correct_answer}" class="inputBtns correct" name="question${num+1}">${element.correct_answer}</input>`
        answerArray = element.incorrect_answers;
        answerArray.forEach((e, key) => {
            answerArray[key] = `<input type="radio" value="${e}" class="inputBtns" name="question${num+1}">${e}</input>`;
        });

        answerArray.push(correctA);

        // console.log(answerArray);



        shuffle(answerArray);

        let object = {
            question: `<label for="question${num+1}"><h3>${element.question}</h3></label>`,
            answers: answerArray
        }

        // console.log(object);

        questionArray.push(object);
    });
}

const getAnswers = (data) => {
    data.results.forEach((element) => {
        correctAnsArray.push(element.correct_answer);
    })
}




getQuiz( response => {

    data = response;

    console.log(response);

    
    createQAndAPairs(data);
    getAnswers(data);

    // console.log(questionArray);
});
    



app.post('/index', (req, res) => {
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
    
    // console.log(score);
    
})


// console.log("this is it: ", questionArray.toString());


app.get('/index', (req, res) => {
   
    res.render('index', {                       
        data: questionArray
    })  

});


app.listen(3001, ()=> {
    console.log("Server is running");
})