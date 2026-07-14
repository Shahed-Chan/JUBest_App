const questionNumber = document.querySelector(".question-number");
const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const answerIndicatorContainer = document.querySelector(".answers-indicator");
const homeBox = document.querySelector(".home-box");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");

let questionCounter = 0;
let currentQuestion;
let availableQuestions = [];
let availableOptions = [];
let correctAnswers = 0;
let attempt = 0;

let quiz;

function getQuizDataFromServer() {
    const pathArray = window.location.pathname.split('/');
    const level = pathArray[2];
    const id = pathArray[4];
    const token = document.querySelector('meta[name="quiz-token"]').content;

    axios.get(`/levels/${level}/quiz/${id}/data-end-point`, { params: { token } })
        .then(response => {
            quiz = response.data;
            return Promise.resolve(quiz);
        })
        .then(quiz => {
            startQuiz(quiz);
        })
        .catch(error => {
            console.log(error);
        });
}



function startQuiz(quiz) {
    //hide homebox 
    homeBox.classList.add("hide");
    //show homebox 
    quizBox.classList.remove("hide");
    //first we will set all questions in availabaleQuestion arry
    setAvailableQuestions(quiz.questions);
    //second we will call getNewQuestion()
    getNewQuestion();
    // to create indicator of answer
    answerIndicator();
}

function setAvailableQuestions(questions) {
    availableQuestions = questions.map((question) => {
        return {
            q: question.q,
            options: question.options,
            answer: question.answer - 1
        };
    });
}

function getNewQuestion() {
    // get a random question index from availableQuestions array
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    // set currentQuestion to the question at the random index
    currentQuestion = availableQuestions[questionIndex];
    // remove the question from the availableQuestions array
    availableQuestions.splice(questionIndex, 1);
    // set options to current question's options
    availableOptions = currentQuestion.options;
    // update question counter
    questionCounter++;
    // show question counter and current question
    questionNumber.innerHTML = `Question ${questionCounter} of ${quiz.questions.length}`;
    questionText.innerHTML = currentQuestion.q;
    // show options
    optionContainer.innerHTML = "";
    for (let i = 0; i < availableOptions.length; i++) {
        const option = document.createElement("div");
        option.className = "option";
        option.innerHTML = availableOptions[i];
        option.setAttribute("data-index", i); // add this line to set the index
        option.setAttribute("onclick", "getResult(this)");
        optionContainer.appendChild(option);
    }
}
function getResult(element) {
    const selectedOption = parseInt(element.dataset.index);
    // check if selected option is correct
    if (selectedOption === currentQuestion.answer) {
        // set the green color to correct option
        element.classList.add("correct");
        // add the indicator to correct mark
        updateAnswersIndicator("correct");
        correctAnswers++;
        // set data-correct="true" on the element
        element.setAttribute("data-correct", "true");
    } else {
        // set the red color to wrong option
        element.classList.add("wrong");
        // add the indicator to wrong mark
        updateAnswersIndicator("wrong");
        // show the correct option by adding green color to the correct option
        optionContainer.children[currentQuestion.answer].classList.add("correct");
    }
    attempt++;
    unclickableOptions();
}





//make  all options  unclickable once the user select  a option (RESTRICT THE USER TO CHANGE THE OPTION AGAIN )
function unclickableOptions() {
    const optionLen = optionContainer.children.length;
    for (let i = 0; i < optionLen; i++) {
        optionContainer.children[i].classList.add("already-answered");
    }
}

function answerIndicator() {
    answerIndicatorContainer.innerHTML = '';
    const totalQuestion = quiz.questions.length;
    for (let i = 0; i < totalQuestion; i++) {
        const indicator = document.createElement("div");
        answerIndicatorContainer.appendChild(indicator);
    }
}

function updateAnswersIndicator(markType) {
    answerIndicatorContainer.children[questionCounter - 1].classList.add(markType);
}

function next() {
    if (questionCounter === quiz.questions.length) {
        quizOver();
    } else {
        getNewQuestion();
    }
}

function quizOver() {
    //hide quiz box 
    quizBox.classList.add("hide");
    //show result box
    resultBox.classList.remove("hide");
    quizResult();
}
// get the quiz result 
function quizResult() {
    resultBox.querySelector(".total-question").innerHTML = quiz.questions.length;
    resultBox.querySelector(".total-attempt").innerHTML = attempt;
    resultBox.querySelector(".total-correct").innerHTML = correctAnswers;
    resultBox.querySelector(".total-wrong").innerHTML = attempt - correctAnswers;
    const percentage = (correctAnswers / quiz.questions.length) * 100;
    resultBox.querySelector(".percentage").innerHTML = percentage.toFixed(2) + "%";
    resultBox.querySelector(".total-score").innerHTML = correctAnswers + " / " + quiz.questions.length;
}

function resetQuize() {
    questionCounter = 0;
    correctAnswers = 0;
    attempt = 0;

}

function TrayAgainQuiz(quiz) {
    //hid the resultBox
    resultBox.classList.add("hide");
    //show  the  quizBox
    quizBox.classList.remove("hide");
    resetQuize();
    startQuiz(quiz);
}
function ExitQuiz() {
    //hide resultBox
    resultBox.classList.add("hide");
    //show homeBox
    homeBox.classList.remove("hide");
    resetQuize(quiz);

}

getQuizDataFromServer();

window.addEventListener('beforeunload', function (event) {
    // Cancel the event as stated by the standard.
    event.preventDefault();

    // Chrome requires returnValue to be set.
    event.returnValue = '';

    // Display the warning message
    return 'Are you sure you want to leave this page? Your changes may not be saved.';
});
