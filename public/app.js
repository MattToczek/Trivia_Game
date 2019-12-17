let i = 1;
const radioBtns = document.getElementsByName(`question${i}`);
console.log(radioBtns.length);

let userAnswers = [];

const answerSubmit = document.getElementById("answerSubmit");

getUserAnswers = () => {
    for (let i = 1 ; i < radioBtns.length ; i++) {
        if (radioBtns[i + 1].checked) {
            userAnswers.push(radioBtns[i - 1].value);
            console.log(radioBtns[i].value);
        }
    } 
    console.log(userAnswers);
};

answerSubmit.addEventListener("click" , () => {
    console.log("Button Clicked");
    getUserAnswers()
    }
);

