// Add a hook for QUnit to report when tests are done.
// This will be called by Puppeteer.
QUnit.done(function(details) {
  if (window.onQunitDone) {
    window.onQunitDone(details);
  }
});

// Log individual test assertions to the console for more detailed debugging
QUnit.log(function(details) {
    if (!details.result) {
        let message = `QUnit Assertion Failed: ${details.module} > ${details.name}\n`
        message += `Message: ${details.message}\n`
        if (details.actual !== details.expected) {
            message += `Expected: ${details.expected}, Actual: ${details.actual}\n`
        }
        if (details.source) {
            message += `Source: ${details.source}\n`
        }
        console.error(message);
    }
});


QUnit.module('Typing Tutor', function(hooks) {
    // Before each test, reset the state by calling initLesson
    hooks.beforeEach(function() {
        initLesson();
    });

    QUnit.test('initLesson: should initialize the lesson correctly', function(assert) {
        const actualLessonText = lessonTextElement.textContent.trim().replace(/\s+/g, ' ');
        assert.equal(actualLessonText, 'the quick brown fox jumps over the lazy dog', 'Lesson text should be loaded correctly');
        assert.equal(userInputElement.value, '', 'User input should be cleared');
        assert.equal(wpmElement.textContent, '0', 'WPM should be reset to 0');
        assert.equal(accuracyElement.textContent, '100%', 'Accuracy should be reset to 100%');
        assert.equal(currentWordIndex, 0, 'currentWordIndex should be 0');
        assert.equal(currentCharIndex, 0, 'currentCharIndex should be 0');
    });

    QUnit.test('User Input: should handle correct character input', function(assert) {
        // Simulate typing the first character of the lesson
        userInputElement.value = 't';
        // Manually trigger the input event
        userInputElement.dispatchEvent(new Event('input'));
        
        const firstCharSpan = lessonTextElement.querySelector('span span');
        assert.ok(firstCharSpan.classList.contains('correct-char'), 'First character should be marked as correct');
    });

    QUnit.test('User Input: should handle incorrect character input', function(assert) {
        // Simulate typing an incorrect character
        userInputElement.value = 'z';
        userInputElement.dispatchEvent(new Event('input'));

        const firstCharSpan = lessonTextElement.querySelector('span span');
        assert.ok(firstCharSpan.classList.contains('incorrect-char'), 'First character should be marked as incorrect');
    });

    QUnit.test('updateStats: should calculate WPM and accuracy correctly', function(assert) {
        // We need to control time for this test, so we'll simulate the passage of time
        const done = assert.async();

        // Simulate typing a word
        userInputElement.value = "the ";
        correctChars = 4;
        totalChars = 4;

        // Manually set the start time to 12 seconds ago (0.2 minutes)
        // WPM = (chars / 5) / minutes = (4 / 5) / 0.2 = 0.8 / 0.2 = 4 WPM
        startTime = new Date().getTime() - 12000;

        updateStats();

        assert.equal(wpmElement.textContent, '4', 'WPM should be calculated correctly');
        assert.equal(accuracyElement.textContent, '100%', 'Accuracy should be 100%');

        // Now, simulate an error
        userInputElement.value = "the z";
        correctChars = 4;
        totalChars = 5;

        updateStats();

        assert.equal(accuracyElement.textContent, '80%', 'Accuracy should be updated to 80%');

        done();
    });
    
    QUnit.test('Virtual Keyboard: should highlight the current key to be pressed', function(assert) {
        initLesson(); // Ensure we are at the start of the lesson
        
        // The first character is 't'
        highlightCurrentKey('t');
        let activeKey = virtualKeyboardElement.querySelector('.key.active');
        assert.ok(activeKey, 'A key should be active');
        assert.equal(activeKey.dataset.key, 't', 'The key "t" should be highlighted');

        // Simulate typing 't' and a space, next char is 'q' from "quick"
        highlightCurrentKey('q');
        activeKey = virtualKeyboardElement.querySelector('.key.active');
        assert.ok(activeKey, 'A new key should be active');
        assert.equal(activeKey.dataset.key, 'q', 'The key "q" should be highlighted after "t "');
    });

});