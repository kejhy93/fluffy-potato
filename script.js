let lessonTextElement;
let userInputElement;
let virtualKeyboardElement;
let wpmElement;
let accuracyElement;
let restartButton;

const lessons = [
    "the quick brown fox jumps over the lazy dog",
    "never underestimate the power of a good book",
    "practice makes perfect keep on typing",
    "type every day to improve your speed and accuracy",
    "hello world this is a typing test for you to try"
];

let currentLessonIndex = 0;
let currentLesson = []; // Array of words for the current lesson
let currentWordIndex = 0;
let currentCharIndex = 0;
let correctChars = 0;
let totalChars = 0;
let startTime = 0;
let timerInterval;

const keyboardLayout = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['capslock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'enter'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
    ['ctrl', 'alt', 'space', 'alt', 'ctrl']
];

function initLesson() {
    // Assign DOM elements inside initLesson, so they are retrieved when the DOM is ready or fixture is set
    lessonTextElement = document.getElementById('lesson-text');
    userInputElement = document.getElementById('user-input');
    virtualKeyboardElement = document.getElementById('virtual-keyboard');
    wpmElement = document.getElementById('wpm');
    accuracyElement = document.getElementById('accuracy');
    restartButton = document.getElementById('restart-button');

    currentLesson = lessons[currentLessonIndex].split(' ');
    currentWordIndex = 0;
    currentCharIndex = 0;
    correctChars = 0;
    totalChars = 0;
    startTime = 0;
    wpmElement.textContent = '0';
    accuracyElement.textContent = '100%';
    userInputElement.value = '';
    userInputElement.disabled = false;
    userInputElement.focus();
    clearInterval(timerInterval);
    renderLessonText();
    renderVirtualKeyboard();
    highlightCurrentKey(''); // Clear any previous key highlights

    // Re-attach event listeners here, as the elements might be re-created by QUnit fixture
    userInputElement.removeEventListener('input', handleUserInput);
    userInputElement.addEventListener('input', handleUserInput);
    restartButton.removeEventListener('click', initLesson);
    restartButton.addEventListener('click', initLesson);
}

function handleUserInput() {
    startTimer();
    updateCharacterFeedback();
    handleLessonProgress();
    updateStats();
}

function updateCharacterFeedback() {
    const typedText = userInputElement.value;
    const lessonText = currentLesson.join(' ');
    const allSpans = lessonTextElement.querySelectorAll('span > span, span[class=""]');

    console.log('--- updateCharacterFeedback started ---');
    console.log('typedText:', typedText);
    console.log('lessonText:', lessonText);

    allSpans.forEach(span => span.classList.remove('correct-char', 'incorrect-char', 'current-char'));

    let newCorrectChars = 0;
    let newTotalChars = 0;
    let upToChar = -1;

    for (let i = 0; i < typedText.length; i++) {
        const charSpan = allSpans[i];
        if (!charSpan) {
            console.log(`Char span not found for index ${i}`);
            continue;
        }

        newTotalChars++;
        let charStatus = '';
        if (typedText[i] === lessonText[i]) {
            charSpan.classList.add('correct-char');
            newCorrectChars++;
            charStatus = 'correct-char';
        } else {
            charSpan.classList.add('incorrect-char');
            charStatus = 'incorrect-char';
        }
        upToChar = i;
        console.log(`Index: ${i}, Typed: '${typedText[i]}', Expected: '${lessonText[i]}', Status: ${charStatus}`);
    }
    
    correctChars = newCorrectChars;
    totalChars = newTotalChars;
    console.log('New correctChars:', correctChars);
    console.log('New totalChars:', totalChars);

    // Highlight the next character
    if (upToChar + 1 < allSpans.length) {
        allSpans[upToChar + 1].classList.add('current-char');
        highlightCurrentKey(lessonText[upToChar + 1]);
        console.log('Highlighting next char:', lessonText[upToChar + 1], 'at index', upToChar + 1);
    } else {
        // End of lesson, clear highlight
        highlightCurrentKey('');
        console.log('End of lesson, clearing key highlight.');
    }
    console.log('--- updateCharacterFeedback finished ---');
}

function handleLessonProgress() {
    const typedText = userInputElement.value;
    const lessonText = currentLesson.join(' ');
    
    // Check for word completion
    const currentWordText = currentLesson[currentWordIndex];
    const typedWords = typedText.split(' ');
    const currentTypedWord = typedWords[currentWordIndex];

    if (currentTypedWord === currentWordText && typedText.endsWith(' ')) {
        // User has correctly typed a word and a space, advance
        currentWordIndex++;
        
        // This logic is simplified; a full app might not clear the input
        // but for this project, we'll follow the pattern of clearing and advancing
        const remainingText = typedWords.slice(currentWordIndex).join(' ');
        if (remainingText === '') {
             userInputElement.value = ''; // Simplified: clear for next word
        }
    }

    // Check for lesson completion
    if (typedText === lessonText) {
        clearInterval(timerInterval);
        userInputElement.disabled = true;
        
        setTimeout(() => {
            alert('Lesson Completed! Well done!');
            currentLessonIndex = (currentLessonIndex + 1) % lessons.length;
            initLesson();
        }, 100);
    }
}


function renderLessonText() {
    lessonTextElement.innerHTML = '';
    currentLesson.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        word.split('').forEach((char, charIndex) => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            if (wordIndex === currentWordIndex && charIndex === currentCharIndex) {
                charSpan.classList.add('current-char');
            }
            wordSpan.appendChild(charSpan);
        });
        lessonTextElement.appendChild(wordSpan);
        if (wordIndex < currentLesson.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            if (wordIndex === currentWordIndex - 1 && currentCharIndex === 0) { // Highlight space after completed word
                spaceSpan.classList.add('current-char');
            }
            lessonTextElement.appendChild(spaceSpan);
        }
    });
}

function renderVirtualKeyboard() {
    virtualKeyboardElement.innerHTML = '';
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.forEach(keyText => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            keyDiv.textContent = keyText.length > 1 ? keyText.charAt(0).toUpperCase() + keyText.slice(1) : keyText; // Capitalize for display
            if (keyText === 'space') {
                keyDiv.classList.add('space');
                keyDiv.textContent = ''; // Spacebar doesn't display text
            }
            // Add data attribute for easier lookup
            keyDiv.dataset.key = keyText;
            rowDiv.appendChild(keyDiv);
        });
        virtualKeyboardElement.appendChild(rowDiv);
    });
}

function highlightCurrentKey(expectedChar) {
    // Clear previous highlights
    document.querySelectorAll('.key.active').forEach(key => key.classList.remove('active'));
    document.querySelectorAll('.key.correct').forEach(key => key.classList.remove('correct'));
    document.querySelectorAll('.key.incorrect').forEach(key => key.classList.remove('incorrect'));

    if (!expectedChar) return;

    // Find the key to highlight
    let targetKey = expectedChar.toLowerCase();
    if (expectedChar === ' ') {
        targetKey = 'space';
    } else if (['.', ',', '/', ';', '\'', '[', ']', '\\', '-', '=', '`'].includes(expectedChar)) {
        // Handle special characters that might be represented differently in dataset.key
        // For simplicity, we assume direct match or common mapping.
        // A more robust solution might map these.
    }

    const keyElement = virtualKeyboardElement.querySelector(`[data-key="${targetKey}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
    }
}

function startTimer() {
    if (startTime === 0) {
        startTime = new Date().getTime();
        timerInterval = setInterval(updateStats, 1000);
    }
}

function updateStats() {
    if (startTime === 0) return; // Do not update stats if the timer hasn't started

    const currentTime = new Date().getTime();
    const timeElapsedInMinutes = (currentTime - startTime) / 60000; // in minutes

    if (timeElapsedInMinutes > 0) {
        const wordsTyped = correctChars / 5; // Average word length is 5 characters
        const wpm = Math.round(wordsTyped / timeElapsedInMinutes);
        wpmElement.textContent = wpm;
    }

    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    accuracyElement.textContent = `${accuracy}%`;
}

function normalizeKey(key) {
    if (key === ' ') return 'space';
    if (key === 'Backspace') return 'backspace';
    if (key === 'Shift') return 'shift';
    if (key === 'Control') return 'ctrl';
    if (key === 'Alt') return 'alt';
    if (key === 'Enter') return 'enter';
    if (key === 'Tab') return 'tab';
    if (key === 'CapsLock') return 'capslock';
    return key.toLowerCase();
}

// Global event listeners for physical key presses (these don't need to be re-attached per test)
document.addEventListener('keydown', (e) => {
    // Only if the user-input element is focused, otherwise physical keypresses might interfere with other elements in the test runner
    if (document.activeElement === userInputElement) {
        // Clear any previous correct/incorrect key highlights on virtual keyboard
        document.querySelectorAll('.key.correct').forEach(key => key.classList.remove('correct'));
        document.querySelectorAll('.key.incorrect').forEach(key => key.classList.remove('incorrect'));

        const pressedKey = normalizeKey(e.key);
        

        const keyElement = virtualKeyboardElement.querySelector(`[data-key="${pressedKey}"]`);
        if (keyElement) {
            keyElement.classList.add('active'); // Temporarily highlight
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (document.activeElement === userInputElement) {
        const releasedKey = normalizeKey(e.key);

        const keyElement = virtualKeyboardElement.querySelector(`[data-key="${releasedKey}"]`);
        if (keyElement) {
            keyElement.classList.remove('active');
            // Add correct/incorrect feedback based on the last typed character
            // Note: This logic might need refinement for precise test environment.
            // For now, it provides a visual indication.
            // In a real typing tutor, this would be tied to the comparison logic.
            const expectedChar = currentLesson[currentWordIndex] ? currentLesson[currentWordIndex][currentCharIndex] : '';
            const currentTypedChar = userInputElement.value[userInputElement.value.length - 1];

            if (currentTypedChar === expectedChar) {
                keyElement.classList.add('correct');
            } else if (currentTypedChar !== undefined) {
                keyElement.classList.add('incorrect');
            }
        }
    }
});

// For local testing, you might want to uncomment this if running index.html directly
document.addEventListener('DOMContentLoaded', () => {
    if (typeof QUnit === 'undefined') {
        initLesson();
    }
});