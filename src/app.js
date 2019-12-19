const express = require("express");
const app = express();
const session = require('express-session')
const request = require('request');
const path = require('path');
const mysql = require('mysql')

app.use(express.static(path.join(__dirname, '../')));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
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
        let correctA = `<input type="radio" value="${element.correct_answer}" class="inputBtns" name="question${num+1}"><span class="inputText correct">${element.correct_answer}</span></input>`
        answerArray = element.incorrect_answers;
        answerArray.forEach((e, key) => {
            answerArray[key] = `<input type="radio" value="${e}" class="inputBtns" name="question${num+1}"><span class="inputText">${e}</span></input>`;
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
    console.log(correctAnsArray);
}


getQuiz( response => {

    data = response;

    //console.log(response); 
  
    createQAndAPairs(data);
    getAnswers(data);


    // console.log(questionArray);
});

let temp1;
let temp2;
let newArray = [];
let finished =0;


let forLoop = (array) => {
    finished = 0;                                  //resets counter outside of loop
    console.log("my array length is: ",array.length);
    console.log("array[0].score is: ",array[0]);  
    console.log("array[1].score is:  ",array[1]);

    
    
    for (let i = 0; i < array.length; i++) {  
        // if( i < 2) {    // loops through array and swaps adjacent values
            if(array[i+1] != undefined && array[i].score < array[i+1].score){
            // if(array[i].score > array[i+1].score){
                temp1 = array[i];
                temp2 = array[i + 1];
                array[i] = temp2;
                array[i + 1] = temp1;
            // }
            console.log("if");  
           


            }else{                                       // if [i] < [i +1], couner increases
                finished++
                if (finished == array.length) {         // if it doesn't make a change through the whole loop, the array is in order.
                    finished = true;
                    console.log("else");
                }
            }
        // }
     
    }
}


let arraynge = (arr)=>{
    
    do {
        forLoop(arr)
    } while (finished != true);                     // loop breaks when counter reaches length of array.

    return arr
}



    
app.get('/highscore', (req, res) => {
    
    if (req.session.loggedin) {
        db.query('SELECT * FROM topScores', function(error, results, fields) {
            console.log("These are the results: ", results);
            // console.log(results[0].score);
            let sortedScores = results
            // let sortedScores = results;
            sortedScores = arraynge(sortedScores);

            if (sortedScores.length>5) {
                sortedScores = sortedScores.splice(sortedScores.length-6, 0, sortedScores.length)
            }
            let position = 1;

            sortedScores.forEach(element => {
                element.position = position;
                position++;
            })
             
            res.render('highscore', {
                scores: sortedScores
            })
        })
    } else {
		res.send('Please login to view this page!');
	}
	// response.end();
})


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

    // console.log("this is session details: ", req.session);
    
    if (req.session.loggedin) {
        userAnswers = Object.values(req.body);
        console.log('My answers');
        console.log(userAnswers);
        userAnswers.forEach(element => {
            if (correctAnsArray.includes(element)) {
                score ++
            }
        })

        console.log("My score is", score);


        // res.render('scoreRead', {
        //     score: score,
        //     data: questionArray

        // })
        
 
        let username = req.session.username;
        console.log(username);
        
        // WORKING SQL query
        let hsCheck = 'SELECT user_score FROM high_scores WHERE user_name = ?';
        // WORKING SQL Query
        let sqlUser = 'SELECT id, user_name FROM users WHERE user_name = ?';
        // WORKING SQL Query
        let idUdCheck = 'SELECT user_id FROM high_scores WHERE user_name = ?'
        // WORKING SQL Query
        let scoreUpdate = 'UPDATE high_scores SET user_score = ? WHERE user_id = ?'
        // WORKING SQL Query
    let writeHs = 'INSERT INTO high_scores SET user_id = ?, user_name = ?, user_score = ?'
        // Check if any user data already exists in the DB 
       db.query(hsCheck, username, (error, result) => {
            console.log( "this is the result: ", result)
            // Error check
            if(error){
                console.log('[INFO] ERROR');
                console.log(error);
            // If the result length is greater than zero, meaning an entry in the DB for that user already exists, then the below function compares the current score and the previous score. I have saved the previous score in a variable, as result was the previously logged score, I can compare the two values. 
            } else if(result.length > 0){
                let prevScore = result[0].user_score; 
                console.log("My prev score is", prevScore);
                console.log("Last score check", score);
                if(score > prevScore){
                    console.log("Inside of score comparison");
                        // If there is no errors, find the ID where the user name is equal to the current user. 
                    db.query(idUdCheck, username, (error, result) => {
                        // Error check
                        if(error){
                            console.log('[INFO] ERROR');
                            console.log(error);
                        } else { 
                            // Then, providing there is no errors, I grab the previous result, which is the user ID, and I grab the new score, store them in an array so that data gets passed into SQL accordingly. The page will then render as expected.
                            let newScore = [score, result[0].user_id]; 
                            console.log('this is the new score for the user', newScore);
                            db.query(scoreUpdate, newScore, (error, result) => {
                                if(error){
                                    console.log('[INFO] ERROR');
                                    console.log(error);
                                } else { 
                                    // Else, we render the page as normal. We also get a console log to show that the update was a success. ADD? A message to congratulate the user on their high score?
                                        console.log('[INFO] Scores updated successfully'); 
                                    res.render('scoreRead', {
                                        score: score,
                                        data: questionArray
                                    })
                                }
                            })
                        
                        }
                    })
                // If the new score isn't higher than previous score, render the page as normal.
                } else {
                    res.render('scoreRead', {
                        score: score,
                        data: questionArray
                
                    })
                }
            } else { 
                // Write the score for the associated user into the high scores DB
                // SELECT id, user_name FROM users WHERE user_name = ?(current username)
                db.query(sqlUser, username, (error, result) => {
                    console.log(result);
                    
                    if(error){
                        console.log('[INFO] ERROR');
                        console.log(error);
                    } else { 
                        console.log("this is the result: ",result);
                        
                        // SELECT id, user_name FROM users WHERE user_name = ?(current username)
                        // High score credentials below is the id and user name from the result, along with the current score. 
                        let hsCredentials = [result[0].user_id, result[0].user_name, score]
                        // A query is then passed to SQL which inserts the new data into the high scores table.
                        db.query(writeHs, hsCredentials, (error, result) => {
                            if(error){
                                console.log('[INFO] ERROR');
                                console.log(error);
                            } else {
                                console.log('[INFO] Score registered successfully'); 
                                res.render('scoreRead', {
                                    score: score,
                                    data: questionArray
                            
                                })
                            }
                        })
                    }
                })
            } 
        })

    

        // score=0;
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


});

app.get('/auth', (req, res) => {
    if (req.session.loggedin) { 
    
        res.render('auth')

    } else {
        res.send('Please login to view this page!');
    }

 
});




app.get('/', (request, response) => {
    
    response.render('login')
}); 

app.post('/auth', function(request, response) {
    // console.log(request.body);
    
    var username = request.body.theUserName;
    // console.log(username);
    
    var password = request.body.thePassword;
    // console.log(password);

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

app.post('/sucessfulSignUp', (request, response) => {
    const userName = request.body.regUsername; 
    const password = request.body.regPassword; 
    const email = request.body.regEmail; 
    let sqlEmailCheck = 'SELECT email FROM users WHERE email = ?'; 
    let sqlUserNameCheck = 'SELECT user_name FROM users WHERE user_name = ?';
    let signUp = 'INSERT INTO users SET user_name = ?, email = ?, user_password = ?';
    let newUser = [userName, email, password];

    db.query(sqlEmailCheck, email, (error, result) => { 
        if(error){
            console.log('[INFO] ERROR');
            console.log(error);
        } else if(result.length > 0){
            // Render "this email has been taken"
        } else{
            db.query(sqlUserNameCheck, userName, (error, result) => {
                if(error){
                    console.log('[INFO] ERROR'); 
                    console.log(error)
                } else if(result.length > 0){
                    // Render "this user name has been taken!"
                } else {
                    db.query(signUp, newUser, (error, result) => {
                        if(error){
                            console.log('[INFO] Error')
                        } else {  
                            response.render('login', {                       
                                data: questionArray
                            })  
                        }
                    })
                }
            })
        }
    })
});


app.listen(3001, ()=> {
    console.log("Server is running");
});