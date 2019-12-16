const express =  require('express');
const app = express();
const request = require('request');



const getQuiz = (catNum = "", callback)=>{
// const getQuiz = ((callback)=>{

    const quizURL = `https://opentdb.com/api.php?amount=10&type=multiple`;

    if (typeof catNum == "number"){
        let catagorySetter = `&category=${catNum}`
        const quizURL = `https://opentdb.com/api.php?amount=10&type=multiple${catagorySetter}`;
    } 

    request({url: quizURL, json:true}, async (err, response )=> {
        
        if(err){

            console.log("ERROR: Cannot connect to API");
            
        }else if(response == undefined){

            callback({
                error: "Cannot find this catagory"
            });
        }
        else{
            
            callback(response);
       }
      
    })
}

getQuiz(2, (response)=>{
    console.log(response);
})