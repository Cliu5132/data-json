const quoteContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const prevButton = document.getElementById('prev-quiz');
const nextButton = document.getElementById('next-quiz');
const quizSelector = document.getElementById('quiz-selector');
const loader = document.getElementById('loader');
const commentElement = document.getElementById('comment');
const apiUrlBase = 'https://h0vyg6ajye.execute-api.ca-central-1.amazonaws.com/items/';

// Loading Spinner Shown
function loading() {
  loader.hidden = false;
  quoteContainer.hidden = true;
}

// Remove Loading Spinner
function complete() {
  if (!loader.hidden) {
    quoteContainer.hidden = false;
    loader.hidden = true;
  }
}

function showComment() {
  commentElement.textContent=localStorage.getItem('comment');
}

function clearComment() {
  commentElement.textContent="";
}

//display correc choice
function showCorrect() {
  const correctIndexes = localStorage.getItem('correctIndexes'); 
  const isMutipleChoice = localStorage.getItem('isMutipleChoice') === 'true';
  const loopTime = isMutipleChoice ? 5 : 4;
  for (let i = 0; i < loopTime; i++) {
    if (correctIndexes.includes(i)) {
      const choiceItem = document.getElementById(`choice-${i}`);
      choiceItem.classList.add('correct-choice');
    }
  }
}

//add red color to wrong choice
function showWrong(wrongIndex) {
  const correctIndexes = localStorage.getItem('correctIndexes'); 
  if(!correctIndexes.includes(wrongIndex)){
    const wrongChoiceItem = document.getElementById(`choice-${wrongIndex}`);
    wrongChoiceItem.classList.add('wrong-choice');
  }
}

//add gray to chosen
function showChosen(chosenIndex) {
  const chosenChoiceItem = document.getElementById(`choice-${chosenIndex}`);
  chosenChoiceItem.classList.add('chosen-choice');
}
//remove gray from chosen
function unShowChosen(chosenIndex) {
  const chosenChoiceItem = document.getElementById(`choice-${chosenIndex}`);
  chosenChoiceItem.classList.remove('chosen-choice');
}


//when user click choice
function submitChoice(e) {
  const isMutipleChoice = localStorage.getItem('isMutipleChoice') === 'true';
  const correctIndexes = localStorage.getItem('correctIndexes'); 
  const userSelectedFirstIndex = localStorage.getItem('userSelectedFirstIndex'); 

  const choiceIndex = e.currentTarget.getAttribute('data-choice-index');

  if (isMutipleChoice) {
    if (userSelectedFirstIndex !== "999") {//when user complete a two-choice question.
      if(userSelectedFirstIndex === choiceIndex){
        console.log(`1`)
        localStorage.setItem('userSelectedFirstIndex', 999); 
        unShowChosen(choiceIndex);
      } else {
        if(correctIndexes.includes(userSelectedFirstIndex) && correctIndexes.includes(choiceIndex)){ //both answer correct
          console.log("Correct")
        } else {//find the wrong answer and give it a red color
          unShowChosen(userSelectedFirstIndex);
          unShowChosen(choiceIndex);
          showWrong(userSelectedFirstIndex);
          showWrong(choiceIndex);
        }
        unShowChosen(userSelectedFirstIndex);
        showCorrect();
        showComment();
      }
    } else {//user select first choice in a multi choice question, this step should store user's first choice
      console.log(`2`)
      localStorage.setItem('userSelectedFirstIndex', choiceIndex);
      showChosen(choiceIndex);
    }
  } else { //single choice
    if(correctIndexes.includes(choiceIndex)){
      console.log("Correct");
    }else{
        showWrong(choiceIndex);
        console.log("Wrong");
    }
    showCorrect();
    showComment();
  }
}

function findIndices(inputString) {
  const indices = [];

  for (let i = 0; i < inputString.length; i++) {
    if (inputString[i] >= 'A' && inputString[i] <= 'Z') {
      indices.push(i);
    }
  }

  return indices;
}

// Function to fetch quiz data by ID
async function fetchQuizData(quizId) {
  clearComment();
  loading();
  const apiUrl = `${apiUrlBase}${quizId}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    questionElement.textContent = data.question;
    // Store data in Local Storage
    localStorage.setItem('comment', data.comment);
    localStorage.setItem('isMutipleChoice', !data.single);
    localStorage.setItem('correctIndexes', findIndices(data.answer));
    localStorage.setItem('userSelectedFirstIndex', 999); 

    choicesElement.innerHTML = '';

    const isMutipleChoice = localStorage.getItem('isMutipleChoice') === 'true';

    const loopTime = isMutipleChoice ? 5 : 4;

    for (let i = 0; i < loopTime; i++) {
      const choiceText = data[`choices/${i}`];
      const choiceItem = document.createElement('li');
      choiceItem.className = 'choice';
      choiceItem.id = `choice-${i}`;
      choiceItem.textContent = `${choiceText}`;
      choicesElement.appendChild(choiceItem);
      // Add a custom data attribute to store the choice index
      choiceItem.setAttribute('data-choice-index', i);
      choiceItem.addEventListener('click', submitChoice);
    } 

  }
  catch(e) {
    console.error('Error fetching data:', error);
  }
  complete();
}

// Get Quiz From API
async function getInitQuiz() {
  loading();
  popDropdown();
  const currentQuizId = 860;
  quizSelector.value = currentQuizId; // Update dropdown selection
  try {
    await fetchQuizData(currentQuizId);
  } catch (error) {
    console.log(`something went wrong: `, error.message);
  }
}

async function getPrevQuiz() {
  loading();
  let currentQuizId = parseInt(quizSelector.value, 10);
  try {
    if (currentQuizId > 1) {
      currentQuizId--;
      fetchQuizData(currentQuizId);
      quizSelector.value = currentQuizId; // Update dropdown selection
    } 
  } catch (error) {
    console.log(`something went wrong getPrevQuiz: `, error.message);
  }
}

async function getNextQuiz() {
  loading();
  let currentQuizId = parseInt(quizSelector.value, 10);
  try {
    if (currentQuizId < 873) {
      currentQuizId++;
      fetchQuizData(currentQuizId);
      quizSelector.value = currentQuizId; // Update dropdown selection
    } 
  } catch (error) {
    console.log(`something went wrong getPrevQuiz: `, error.message);
  }
}

function updateSelectedQuiz() {
  const selectedQuizId = parseInt(quizSelector.value, 10);
  if (!isNaN(selectedQuizId)) {
    currentQuizId = selectedQuizId;
    fetchQuizData(currentQuizId);
  }
}

// Event Listeners
prevButton.addEventListener('click', getPrevQuiz);
nextButton.addEventListener('click', getNextQuiz);
quizSelector.addEventListener('change', updateSelectedQuiz);

// Populate the dropdown with quiz options
function popDropdown() {
  for (let i = 1; i <= 873; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Quiz ${i}`;
    quizSelector.appendChild(option);
  }
}

// On Load
getInitQuiz();
