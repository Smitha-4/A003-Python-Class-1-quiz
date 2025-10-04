const userId = crypto.randomUUID();
console.log("Quiz initialized. Session User ID:", userId);

// --- Quiz Data ---
const quizQuestions = [
    {
        question: "What is the output of the following Python code?\n\n`print(\"Hello\", 2025, \"World!\")`",
        options: [
            { text: "Hello2025World!", isCorrect: false },
            { text: "Hello 2025 World!", isCorrect: true },
            { text: "(\"Hello\", 2025, \"World!\")", isCorrect: false },
            { text: "Error", isCorrect: false }
        ],
        rationale: "The `print()` function, by default, inserts a single space character between the items passed as arguments."
    },
    {
        question: "What is the final output of this code snippet?\n\n`print(\"Line 1\", end=\"\"); print(\"Line 2\")`",
        options: [
            { text: "Line 1\\nLine 2", isCorrect: false },
            { text: "Line 1Line 2", isCorrect: true },
            { text: "Line 1 Line 2", isCorrect: false },
            { text: "Error: `end` must be a newline character.", isCorrect: false }
        ],
        rationale: "The `end=\"\"` argument in the first `print()` call overrides the default newline, causing the second `print()` to immediately follow on the same line."
    },
    {
        question: "Which output is produced by the code:\n\n`print(\"A\", \"B\", \"C\", sep='--')`?",
        options: [
            { text: "A B C", isCorrect: false },
            { text: "A--B--C", isCorrect: true },
            { text: "A\\nB\\nC", isCorrect: false },
            { text: "A B C --", isCorrect: false }
        ],
        rationale: "The `sep` (separator) argument specifies that the string `'--'` should be placed between all positional arguments."
    },
    {
        question: "What is the default value of the `end` parameter in the `print()` function?",
        options: [
            { text: "\" \" (a single space)", isCorrect: false },
            { text: "\"\"", isCorrect: false },
            { text: "\\n", isCorrect: true },
            { text: "\\r", isCorrect: false }
        ],
        rationale: "The default value for end is the newline character, which is why subsequent print() calls usually start on a new line."
    },
    {
        question: "What is the output of the following Python code?\n\n`print(1 + 2 * 3, 'Result is')`",
        options: [
            { text: "9 Result is", isCorrect: false },
            { text: "7 Result is", isCorrect: true },
            { text: "Error: Cannot print integer and string together", isCorrect: false },
            { text: "1 + 2 * 3 Result is", isCorrect: false }
        ],
        rationale: "Python evaluates the arithmetic expression first according to the standard order of operations (multiplication before addition), resulting in $1 + 6 = 7$. The `print()` function then prints the evaluated integer, followed by the string, separated by a default space."
    },
    {
        question: "What is the result of the code?\n\n`print(1, 2, sep='-', end='#'); print(3)`",
        options: [
            { text: "1-2\\n3", isCorrect: false },
            { text: "1-2#3", isCorrect: true },
            { text: "1#2-3", isCorrect: false },
            { text: "1 2\\n3", isCorrect: false }
        ],
        rationale: "The arguments `1` and `2` are separated by `-`, the entire output is terminated by `#`, and then the second `print(3)` starts on the same line, followed by its default newline."
    },
    {
        question: "Which optional argument of the `print()` function allows you to redirect the output to a file or a different stream instead of the standard console (stdout)?",
        options: [
            { text: "stream", isCorrect: false },
            { text: "destination", isCorrect: false },
            { text: "redirect", isCorrect: false },
            { text: "file", isCorrect: true }
        ],
        rationale: "The `file` parameter is used to specify a file-like object (like an open file stream) to which the output should be written instead of the console."
    },
    {
        question: "What is the simplest way to print a completely empty line (a single newline character) using the `print()` function?",
        options: [
            { text: "print(\"\\n\")", isCorrect: false },
            { text: "print(end='\\n')", isCorrect: false },
            { text: "print()", isCorrect: true },
            { text: "print('')", isCorrect: false }
        ],
        rationale: "When called with no arguments, `print()` still outputs the default `end` character, which is a newline, effectively printing an empty line."
    },
    {
        question: "Which of the following function calls will result in a Python `SyntaxError`?",
        options: [
            { text: "print('Hello', end='.')", isCorrect: false },
            { text: "print(end='.', 'Hello')", isCorrect: true },
            { text: "print(sep='*', 'A', 'B')", isCorrect: false },
            { text: "print('A', end='\\n', sep='-')", isCorrect: false }
        ],
        rationale: "Positional arguments (like `'Hello'`) must always appear before keyword arguments (like `end='.'`) in a function call, making this invalid syntax."
    },
    {
        question: "What is the output of the code:\n\n`print(\"Start\", \"End\", sep='\\t')` (where `\\t` is the tab character)?",
        options: [
            { text: "Start End", isCorrect: false },
            { text: "Start\\tEnd", isCorrect: false },
            { text: "Start	End (separated by a tab space)", isCorrect: true },
            { text: "Start\\nEnd", isCorrect: false }
        ],
        rationale: "The `sep='\\t'` argument uses the tab escape sequence as the separator between the two printed strings."
    }
];

// --- Quiz State and Logic ---
let userAnswers = {}; // { qIndex: selectedOptionIndex }
let currentQuestionIndex = 0;
let score = 0;
let isQuizSubmitted = false;

const quizArea = document.getElementById('quiz-area');
const resultsArea = document.getElementById('results-area');
const scoreSummary = document.getElementById('score-summary');
const reviewList = document.getElementById('review-list');
const restartButton = document.getElementById('restart-button');
const emailButton = document.getElementById('email-button');

// --- PDF Generation Function ---
const generateAndDownloadPDF = () => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error("jsPDF library not loaded.");
        return;
    }

    const doc = new jsPDF();
    let y = 15;
    const lineHeight = 7;
    const pageMargin = 15;
    const maxLineWidth = 180; // Max width for text wrapping

    // Title
    doc.setFontSize(22);
    doc.setTextColor(60, 60, 200); // Blue
    doc.text("Python print() Quiz Results", pageMargin, y);
    y += 10;

    // Score Summary
    const total = quizQuestions.length;
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0); // Green
    doc.text(`Student ID: ${userId}`, pageMargin, y);
    y += lineHeight * 0.7;
    doc.text(`Final Score: ${score} / ${total} (${((score / total) * 100).toFixed(1)}%)`, pageMargin, y);
    y += 15;

    // Q&A Loop
    quizQuestions.forEach((qData, qIndex) => {
        if (y > 280) { // Check for page overflow (A4 height is ~297mm)
            doc.addPage();
            y = pageMargin;
        }

        const selectedIndex = userAnswers[qIndex];
        const isCorrect = selectedIndex !== undefined && qData.options[selectedIndex]?.isCorrect;
        const status = isCorrect ? 'CORRECT' : 'INCORRECT';

        // Question Header
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20); // Black for headers
        doc.text(`Question ${qIndex + 1} (${status})`, pageMargin, y);
        y += lineHeight * 0.7;

        // Question Text (Multi-line support)
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50); // Dark Gray
        const questionText = qData.question.replace(/`/g, '').trim();
        const qLines = doc.splitTextToSize(questionText, maxLineWidth);
        doc.text(qLines, pageMargin, y);
        y += qLines.length * lineHeight;

        // Selected Answer
        doc.setFontSize(10);
        doc.setTextColor(150, 0, 0); // Red for answer
        const selectedOptionText = qData.options[selectedIndex] ? qData.options[selectedIndex].text : 'No Answer';
        const yourAnswerLines = doc.splitTextToSize(`Your Answer: ${selectedOptionText}`, maxLineWidth);
        doc.text(yourAnswerLines, pageMargin, y);
        y += yourAnswerLines.length * lineHeight;

        // Correct Answer
        const correctAnswer = qData.options.find(opt => opt.isCorrect).text;
        doc.setTextColor(0, 100, 0); // Dark Green
        const correctAnswerLines = doc.splitTextToSize(`Correct Answer: ${correctAnswer}`, maxLineWidth);
        doc.text(correctAnswerLines, pageMargin, y);
        y += correctAnswerLines.length * lineHeight;

        // Rationale/Explanation
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100); // Light Gray
        doc.text('Explanation:', pageMargin, y);
        y += lineHeight * 0.7;

        const rationaleLines = doc.splitTextToSize(qData.rationale, maxLineWidth);
        doc.text(rationaleLines, pageMargin, y);
        y += rationaleLines.length * lineHeight + 5; // Extra spacing
    });

    // Save PDF - triggers download
    doc.save('Python_print_Quiz_Results.pdf');
};

// Helper function to escape HTML for display
const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\\n/g, '<br>')
        .replace(/\\t/g, '&emsp;');
};

// Renders a single question
const renderQuestion = (qIndex) => {
    const qData = quizQuestions[qIndex];
    const isAnswered = userAnswers.hasOwnProperty(qIndex);
    const selectedIndex = isAnswered ? userAnswers[qIndex] : null;

    const questionHtml = `
                <div class="question-card">
                    <p class="text-lg">
                        Question ${qIndex + 1} of ${quizQuestions.length}:
                    </p>
                    <pre class="code-block">${escapeHtml(qData.question)}</pre>

                    <div class="options">
                        ${qData.options.map((option, oIndex) => {
        let optionClasses = 'option-button';
        let icon = '';

        if (isAnswered) {
            optionClasses += ' disabled-state';
            if (option.isCorrect) {
                optionClasses += ' correct';
                icon = '<span class="status-icon" style="color:#4ade80; margin-left: 0.5rem;">✓ Correct</span>';
            } else if (selectedIndex === oIndex) {
                optionClasses += ' incorrect';
                icon = '<span class="status-icon" style="color:#f87171; margin-left: 0.5rem;">✗ Your Answer</span>';
            }
        }

        return `
                                <button
                                    class="${optionClasses}"
                                    data-q-index="${qIndex}"
                                    data-o-index="${oIndex}"
                                    onclick="handleAnswer(this)"
                                    ${isAnswered ? 'disabled' : ''}
                                >
                                    <span style="font-weight: 700; margin-right: 0.5rem;">${String.fromCharCode(65 + oIndex)}.</span>
                                    ${escapeHtml(option.text)}
                                    ${icon}
                                </button>
                            `;
    }).join('')}
                    </div>

                    <!-- Rationale (Visible only after submission or review) -->
                    ${isQuizSubmitted || isAnswered ? `
                        <div class="rationale">
                            <p class="font-bold">Explanation:</p>
                            <p>${escapeHtml(qData.rationale)}</p>
                        </div>
                    ` : ''}
                </div>
            `;
    return questionHtml;
};

// Handles user selection of an option
window.handleAnswer = (button) => {
    const qIndex = parseInt(button.dataset.qIndex);
    const oIndex = parseInt(button.dataset.oIndex);

    // Store the answer
    userAnswers[qIndex] = oIndex;

    // Re-render the current question to show selection and rationale
    const questionElement = button.closest('.question-card');
    questionElement.outerHTML = renderQuestion(qIndex);

    // Re-render the current view to enable the "Next" button
    renderCurrentView();

    // Scroll to the rationale for better visibility
    const rationaleElement = document.querySelector('.rationale');
    if (rationaleElement) {
        rationaleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Calculates score, shows results screen, and triggers PDF download
const submitQuiz = () => {
    score = 0;
    isQuizSubmitted = true;
    let reviewHtml = '';

    quizQuestions.forEach((qData, qIndex) => {
        const selectedIndex = userAnswers[qIndex];
        const isCorrect = selectedIndex !== undefined && qData.options[selectedIndex]?.isCorrect;

        if (isCorrect) {
            score++;
        }

        // Render all questions for review (including rationale)
        reviewHtml += renderQuestion(qIndex);
    });

    // --- NEW: Generate and Download PDF ---
    generateAndDownloadPDF();

    // Update UI elements
    const total = quizQuestions.length;
    scoreSummary.textContent = `You scored ${score} out of ${total}. (${((score / total) * 100).toFixed(1)}%)`;
    reviewList.innerHTML = reviewHtml;

    // Hide quiz, show results
    quizArea.style.display = 'none';
    resultsArea.style.display = 'block';

    // Set up email link (for text body)
    setupEmailLink(score, total);
};
// Expose submitQuiz globally for the button click
window.submitQuiz = submitQuiz;


// Generates the mailto link with basic results and instructions
const setupEmailLink = (score, total) => {
    const subject = encodeURIComponent(`Python print() Quiz Results: ${score}/${total}`);
    const body = encodeURIComponent(`Hello Smitha,\n\nI have completed the Python print() Quiz.\n\nMy Score: ${score} out of ${total}.\nPercentage: ${((score / total) * 100).toFixed(1)}%\n\nThe detailed PDF file has been downloaded and is attached to this email.\n\n---\nSession User ID: ${userId}`);

    const mailtoUrl = `mailto:code.smitha@gmail.com?subject=${subject}&body=${body}`;

    emailButton.onclick = () => {
        window.location.href = mailtoUrl;
    };
};


// Navigates between questions
const navigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < quizQuestions.length) {
        currentQuestionIndex = newIndex;
        renderCurrentView();
        // Scroll to top of the quiz area for better UX
        quizArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
// Making navigate available globally for existing inline handlers
window.navigate = navigate;


// Renders the current view (question or results)
const renderCurrentView = () => {
    if (isQuizSubmitted) {
        return;
    }

    const qIndex = currentQuestionIndex;
    const totalQuestions = quizQuestions.length;
    // Check if the current question has been answered
    const isCurrentAnswered = userAnswers.hasOwnProperty(qIndex);
    const allAnswered = Object.keys(userAnswers).length === totalQuestions;

    // Next button is disabled if it's the last question OR if the current question is unanswered.
    const isNextDisabled = qIndex === totalQuestions - 1 || !isCurrentAnswered;

    // 1. Generate HTML content
    const quizContentHtml = `
                ${renderQuestion(qIndex)}
                <div id="navigation-area">
                    <button id="prev-button" data-index="${qIndex - 1}" ${qIndex === 0 ? 'disabled' : ''} class="nav-button prev">
                        &larr; Previous
                    </button>
                    <div class="status-text">
                        Question ${qIndex + 1} / ${totalQuestions}
                    </div>
                    <button id="next-button" data-index="${qIndex + 1}" ${isNextDisabled ? 'disabled' : ''} class="nav-button next">
                        Next &rarr;
                    </button>
                </div>
                ${allAnswered ? `
                    <div style="margin-top: 1rem;">
                        <button onclick="submitQuiz()" class="main-button submit-button">
                            Download & Review Results
                        </button>
                    </div>
                ` : ''}
            `;

    // 2. Insert HTML
    quizArea.innerHTML = quizContentHtml;

    // Scroll to top of the quiz area only after the initial load
    if (quizArea.dataset.initialLoad === 'true') {
        quizArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        quizArea.dataset.initialLoad = 'true';
    }
};

// Resets the quiz state
const resetQuiz = () => {
    userAnswers = {};
    currentQuestionIndex = 0;
    score = 0;
    isQuizSubmitted = false;
    resultsArea.style.display = 'none';
    quizArea.style.display = 'flex';
    delete quizArea.dataset.initialLoad;
    renderCurrentView();
};

// Event listener for restart button
restartButton.addEventListener('click', resetQuiz);

// Initial render: Start the quiz immediately and set up event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Add robust event delegation for navigation buttons on the main quiz area
    quizArea.addEventListener('click', (event) => {
        const target = event.target.closest('.nav-button');

        if (target) {
            const newIndex = parseInt(target.dataset.index);
            if (!target.disabled) {
                navigate(newIndex);
            }
        }
    });

    renderCurrentView();
});