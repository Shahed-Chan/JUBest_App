function refreshIndices() {
    const questions = document.querySelectorAll('.question');
    questions.forEach((questionDiv, qIdx) => {
        questionDiv.id = `question-${qIdx + 1}`;
        questionDiv.querySelector('.form-label').textContent = `Question ${qIdx + 1}:`;

        const questionInput = questionDiv.querySelector('.isFilled');
        questionInput.name = `questions[${qIdx}][question]`;

        const options = questionDiv.querySelectorAll('.option');
        options.forEach((optionDiv, oIdx) => {
            // Update the option label text
            const optionLabel = optionDiv.querySelector('.form-check-label');
            optionLabel.textContent = `Option ${oIdx + 1}:`;

            optionDiv.id = `question-${qIdx + 1}-option-${oIdx + 1}-input`;
            const optionInput = optionDiv.querySelector('.isFilled');
            optionInput.name = `questions[${qIdx}][options][${oIdx}]`;
        });

        updateCorrectAnswer(questionDiv, qIdx);
    });
}

function updateCorrectAnswer(questionDiv, qIdx) {
    const correctAnswerInput = questionDiv.querySelector('[name^="questions"][name*="correctAnswer"]');
    correctAnswerInput.name = `questions[${qIdx}][correctAnswer]`;
    correctAnswerInput.id = `question-${qIdx + 1}-correct-answer`;
}

const questionsDiv = document.getElementById('questions');
const addQuestionBtn = document.getElementById('add-question');
let questionNumber = 1;

addQuestionBtn.addEventListener('click', () => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question', 'mb-3', 'p-3', 'border', 'border-secondary', 'rounded');
    questionDiv.id = `question-${questionNumber}`;

    const questionLabel = document.createElement('label');
    questionLabel.classList.add('form-label');
    questionLabel.textContent = `Question ${questionNumber}:`;

    const questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.name = `questions[${questionNumber - 1}][question]`;
    questionInput.classList.add('form-control', 'isFilled');
    questionInput.required = true;
    questionInput.id = `question-${questionNumber}-input`;

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    const addOptionBtn = document.createElement('button');
    addOptionBtn.type = 'button';
    addOptionBtn.textContent = 'Add Option';
    addOptionBtn.classList.add('btn', 'btn-secondary', 'my-3');

    let optionNumber = optionsDiv.children.length + 1;
    function updateMax() {
        correctAnswerInput.setAttribute('max', optionNumber - 1);
        if (correctAnswerInput.value > optionNumber) {
            correctAnswerInput.value = optionNumber;
        }
    }

    addOptionBtn.addEventListener('click', () => {
        const questionNumber = parseInt(questionDiv.id.split('-')[1]); // Get the question number from the question div's id
        const optionLabel = document.createElement('label');
        optionLabel.classList.add('form-check-label', 'col-auto');
        optionLabel.textContent = `Option ${optionNumber}:`;

        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.name = `questions[${questionNumber - 1}][options][${optionNumber - 1}]`;
        optionInput.classList.add('form-control', 'col-lg-6', 'isFilled');
        optionInput.required = true;
        optionInput.id = `question-${questionNumber}-option-${optionNumber}-input`;

        const optionLabelContainer = document.createElement('div');
        optionLabelContainer.classList.add('form-check', 'd-flex', 'align-items-center', 'py-1', 'my-1', 'option');

        const removeOptionBtn = document.createElement('button'); // Create the "Remove Option" button
        removeOptionBtn.type = 'button';
        const strongElement = document.createElement('strong'); // Create the <strong> element
        strongElement.textContent = 'X';

        removeOptionBtn.appendChild(strongElement); // Append the <strong> element to the button
        removeOptionBtn.classList.add('btn', 'ms-3', 'col-auto');

        removeOptionBtn.addEventListener('click', () => {
            optionLabelContainer.remove();
            --optionNumber;
            updateMax()
            refreshIndices();
        });

        const optionContainer = document.createElement('div');
        optionContainer.classList.add('flex-grow-1');
        optionContainer.appendChild(optionInput);

        optionLabelContainer.appendChild(optionLabel);
        optionLabelContainer.appendChild(optionContainer);
        optionLabelContainer.appendChild(removeOptionBtn);
        optionsDiv.appendChild(optionLabelContainer);

        optionNumber++;


        // Check if the "Correct Answer" section has already been added to the DOM
        if (!correctAnswerDiv.parentNode && optionsDiv.children.length > 0) {
            // Add the "Correct Answer" section to the DOM
            questionDiv.insertBefore(correctAnswerDiv, addOptionBtn);
        }
        updateMax()
    });

    const correctAnswerDiv = document.createElement('div'); // Create a new div to wrap the label and input elements
    correctAnswerDiv.classList.add('form-group', 'mt-3'); // Add margin top to separate from Add Option button

    const correctAnswerLabel = document.createElement('label');
    correctAnswerLabel.classList.add('form-label');
    correctAnswerLabel.textContent = `Correct Answer:`;

    const correctAnswerInput = document.createElement('input');
    correctAnswerInput.type = 'number';
    correctAnswerInput.name = `questions[${questionNumber - 1}][correctAnswer]`;
    correctAnswerInput.classList.add('form-control', 'col-3');
    correctAnswerInput.required = true;
    correctAnswerInput.id = `question-${questionNumber}-correct-answer`;
    correctAnswerInput.setAttribute('max', optionNumber);
    correctAnswerInput.setAttribute('min', 1);

    correctAnswerDiv.appendChild(correctAnswerLabel);
    correctAnswerDiv.appendChild(correctAnswerInput);

    const removeQuestionBtn = document.createElement('button'); // Create the "Remove Question" button
    removeQuestionBtn.type = 'button';
    removeQuestionBtn.textContent = 'Remove Question';
    removeQuestionBtn.classList.add('btn', 'btn-danger', 'my-3');

    removeQuestionBtn.addEventListener('click', () => {
        questionDiv.remove();
        --questionNumber;
        refreshIndices();
        enableSubmit();
    });

    questionDiv.appendChild(questionLabel);
    questionDiv.appendChild(questionInput);
    questionDiv.appendChild(optionsDiv);
    questionDiv.appendChild(addOptionBtn);
    questionDiv.appendChild(correctAnswerDiv);
    questionDiv.appendChild(removeQuestionBtn);
    questionsDiv.appendChild(questionDiv);

    questionNumber++;
});

const questionDiv = document.getElementById('questions');
const submitBtn = document.getElementById('create-quiz-btn');

questionDiv.addEventListener('input', enableSubmit);

const nameInput = document.getElementById('name');
let quizName = '';

nameInput.addEventListener('input', () => {
    quizName = nameInput.value.trim();
    enableSubmit();
});

function enableSubmit() {
    // Get all input fields with class "isFilled"
    const inputs = questionDiv.querySelectorAll('.isFilled');

    // Check if there is at least one question, one option, and a correct answer
    const hasQuestion = questionDiv.querySelectorAll('.question').length > 0;
    const hasOption = questionDiv.querySelectorAll('.flex-grow-1').length > 0;
    const hasCorrectAnswer = Array.from(questionDiv.querySelectorAll('[name^="questions"]'))
        .some(input => input.name.includes('correctAnswer') && input.value !== '');

    // Check if all input fields have a value
    const allInputsFilled = Array.from(inputs).every(input => {
        if (input.type === 'text' || input.type === 'number') {
            return input.value.trim() !== ''; // trim() to remove whitespace
        }
        return false;
    });

    // Check if each question has at least two options
    const questions = questionDiv.querySelectorAll('.question');
    const hasTwoOptionsPerQuestion = Array.from(questions).every(question => {
        const options = question.querySelectorAll('.flex-grow-1');
        return options.length >= 2;
    });

    // Enable submit button if all fields are filled in and there is at least one question, one option, and a correct answer
    if (allInputsFilled && hasQuestion && hasOption && hasCorrectAnswer && hasTwoOptionsPerQuestion && quizName.trim() !== '') {
        submitBtn.removeAttribute('disabled');
    } else {
        submitBtn.setAttribute('disabled', true);
    }
}


let isQuizCreated = false;

submitBtn.addEventListener('click', () => {
    // Set isQuizCreated to true when the "Create Quiz" button is clicked
    isQuizCreated = true;
    // ...
});

window.addEventListener('beforeunload', function (event) {
    if (!isQuizCreated) {
        // Cancel the event as stated by the standard.
        event.preventDefault();

        // Chrome requires returnValue to be set.
        event.returnValue = '';

        // Display the warning message
        return 'Are you sure you want to leave this page? Your changes may not be saved.';
    }
});






