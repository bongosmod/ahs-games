/* =========================================
   WORDSMITH
   CLASSIC MODE
========================================= */

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;


/* =========================================
   GAME VARIABLES
========================================= */

let answer = "";
let currentRow = 0;
let currentCol = 0;

let board = [];

let gameOver = false;


/* =========================================
   HTML ELEMENTS
========================================= */

const messageElement =
    document.getElementById("message");

const boardElement =
    document.getElementById("game-board");

const keyboardElement =
    document.getElementById("keyboard");

const helpButton =
    document.getElementById("help-button");

const helpOverlay =
    document.getElementById("help-overlay");

const closeHelpButton =
    document.getElementById("close-help");

const gameOverlay =
    document.getElementById("game-overlay");

const gameTitle =
    document.getElementById("game-title");

const gameDescription =
    document.getElementById("game-description");

const answerDisplay =
    document.getElementById("answer-display");

const closeGameButton =
    document.getElementById("close-game");


/* =========================================
   LOAD PUZZLE
========================================= */

async function loadPuzzle() {

    try {

        const response =
            await fetch(
                "../puzzles/wordsmith.json?timestamp=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Could not load today's Wordsmith puzzle."
            );

        }


        const puzzle =
            await response.json();


        if (
            !puzzle.word ||
            typeof puzzle.word !== "string"
        ) {

            throw new Error(
                "Wordsmith puzzle is missing its answer."
            );

        }


        answer =
            puzzle.word
                .trim()
                .toUpperCase();


        if (
            answer.length !== WORD_LENGTH ||
            !/^[A-Z]+$/.test(answer)
        ) {

            throw new Error(
                "Wordsmith answer is invalid."
            );

        }


        startGame();


    } catch (error) {

        console.error(
            "Wordsmith failed to load:",
            error
        );


        if (messageElement) {

            messageElement.textContent =
                "Couldn't load today's Wordsmith.";

        }

    }

}


/* =========================================
   START GAME
========================================= */

function startGame() {

    currentRow = 0;

    currentCol = 0;

    gameOver = false;


    board = [];


    for (
        let row = 0;
        row < MAX_ATTEMPTS;
        row++
    ) {

        board[row] = [];


        for (
            let col = 0;
            col < WORD_LENGTH;
            col++
        ) {

            board[row][col] = "";

        }

    }


    if (gameOverlay) {

        gameOverlay.classList.remove(
            "show"
        );

    }


    if (messageElement) {

        messageElement.textContent = "";

    }


    createBoard();

    createKeyboard();

}


/* =========================================
   CREATE BOARD
========================================= */

function createBoard() {

    if (!boardElement) {
        return;
    }


    boardElement.innerHTML = "";


    for (
        let row = 0;
        row < MAX_ATTEMPTS;
        row++
    ) {

        const rowElement =
            document.createElement("div");


        rowElement.className =
            "wordsmith-row";


        for (
            let col = 0;
            col < WORD_LENGTH;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "wordsmith-cell";


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            rowElement.appendChild(
                cell
            );

        }


        boardElement.appendChild(
            rowElement
        );

    }

}


/* =========================================
   CREATE KEYBOARD
========================================= */

function createKeyboard() {

    if (!keyboardElement) {
        return;
    }


    keyboardElement.innerHTML = "";


    const keyboardRows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];


    keyboardRows.forEach(
        function (letters) {

            const rowElement =
                document.createElement("div");


            rowElement.className =
                "wordsmith-keyboard-row";


            letters
                .split("")
                .forEach(
                    function (letter) {

                        const button =
                            document.createElement(
                                "button"
                            );


                        button.type =
                            "button";


                        button.className =
                            "wordsmith-key";


                        button.textContent =
                            letter;


                        button.dataset.letter =
                            letter;


                        button.addEventListener(
                            "click",
                            function () {

                                enterLetter(
                                    letter
                                );

                            }
                        );


                        rowElement.appendChild(
                            button
                        );

                    }
                );


            keyboardElement.appendChild(
                rowElement
            );

        }
    );


    const bottomRow =
        document.createElement("div");


    bottomRow.className =
        "wordsmith-keyboard-row";


    const enterButton =
        document.createElement("button");


    enterButton.type =
        "button";


    enterButton.className =
        "wordsmith-key wordsmith-wide-key";


    enterButton.textContent =
        "ENTER";


    enterButton.addEventListener(
        "click",
        submitGuess
    );


    bottomRow.appendChild(
        enterButton
    );


    const backspaceButton =
        document.createElement("button");


    backspaceButton.type =
        "button";


    backspaceButton.className =
        "wordsmith-key wordsmith-wide-key";


    backspaceButton.textContent =
        "⌫";


    backspaceButton.addEventListener(
        "click",
        deleteLetter
    );


    bottomRow.appendChild(
        backspaceButton
    );


    keyboardElement.appendChild(
        bottomRow
    );

}


/* =========================================
   ENTER LETTER
========================================= */

function enterLetter(letter) {

    if (gameOver) {
        return;
    }


    if (
        currentCol >= WORD_LENGTH
    ) {

        return;

    }


    board[currentRow][currentCol] =
        letter;


    updateBoard();


    currentCol++;

}


/* =========================================
   DELETE LETTER
========================================= */

function deleteLetter() {

    if (gameOver) {
        return;
    }


    if (currentCol <= 0) {
        return;
    }


    currentCol--;


    board[currentRow][currentCol] =
        "";


    updateBoard();

}


/* =========================================
   UPDATE BOARD
========================================= */

function updateBoard() {

    if (!boardElement) {
        return;
    }


    const cells =
        boardElement.querySelectorAll(
            ".wordsmith-cell"
        );


    cells.forEach(
        function (cell) {

            const row =
                Number(
                    cell.dataset.row
                );


            const col =
                Number(
                    cell.dataset.col
                );


            cell.textContent =
                board[row][col];

        }
    );

}


/* =========================================
   SUBMIT GUESS
========================================= */

function submitGuess() {

    if (gameOver) {
        return;
    }


    if (
        currentCol !== WORD_LENGTH
    ) {

        showMessage(
            "Not enough letters."
        );

        return;

    }


    const guess =
        board[currentRow].join("");


    evaluateGuess(
        guess
    );

}


/* =========================================
   EVALUATE GUESS
========================================= */

function evaluateGuess(guess) {

    const result =
        Array(
            WORD_LENGTH
        ).fill(
            "incorrect"
        );


    const remaining =
        answer.split("");


    /*
        FIRST PASS
        Correct positions.
    */

    for (
        let i = 0;
        i < WORD_LENGTH;
        i++
    ) {

        if (
            guess[i] === answer[i]
        ) {

            result[i] =
                "correct";


            remaining[i] =
                null;

        }

    }


    /*
        SECOND PASS
        Correct letter,
        wrong position.
    */

    for (
        let i = 0;
        i < WORD_LENGTH;
        i++
    ) {

        if (
            result[i] === "correct"
        ) {

            continue;

        }


        const index =
            remaining.indexOf(
                guess[i]
            );


        if (index !== -1) {

            result[i] =
                "present";


            remaining[index] =
                null;

        }

    }


    revealRow(
        currentRow,
        result
    );


    updateKeyboard(
        guess,
        result
    );


    if (
        guess === answer
    ) {

        winGame();

        return;

    }


    currentRow++;

    currentCol = 0;


    if (
        currentRow >= MAX_ATTEMPTS
    ) {

        loseGame();

    }

}


/* =========================================
   REVEAL ROW
========================================= */

function revealRow(
    row,
    result
) {

    if (!boardElement) {
        return;
    }


    for (
        let col = 0;
        col < WORD_LENGTH;
        col++
    ) {

        const cell =
            boardElement.querySelector(
                '.wordsmith-cell[data-row="' +
                row +
                '"][data-col="' +
                col +
                '"]'
            );


        if (!cell) {
            continue;
        }


        cell.classList.add(
            result[col]
        );

    }

}


/* =========================================
   UPDATE KEYBOARD
========================================= */

function updateKeyboard(
    guess,
    result
) {

    if (!keyboardElement) {
        return;
    }


    for (
        let i = 0;
        i < WORD_LENGTH;
        i++
    ) {

        const letter =
            guess[i];


        const button =
            keyboardElement.querySelector(
                '[data-letter="' +
                letter +
                '"]'
            );


        if (!button) {
            continue;
        }


        if (
            result[i] === "correct"
        ) {

            button.classList.remove(
                "present",
                "incorrect"
            );


            button.classList.add(
                "correct"
            );


            continue;

        }


        if (
            result[i] === "present" &&
            !button.classList.contains(
                "correct"
            )
        ) {

            button.classList.remove(
                "incorrect"
            );


            button.classList.add(
                "present"
            );


            continue;

        }


        if (
            result[i] === "incorrect" &&
            !button.classList.contains(
                "correct"
            ) &&
            !button.classList.contains(
                "present"
            )
        ) {

            button.classList.add(
                "incorrect"
            );

        }

    }

}


/* =========================================
   WIN GAME
========================================= */

function winGame() {

    gameOver = true;


    showMessage(
        "You got it!"
    );


    if (gameTitle) {

        gameTitle.textContent =
            "You Won!";

    }


    if (gameDescription) {

        gameDescription.textContent =
            "You found today's word!";

    }


    if (answerDisplay) {

        answerDisplay.textContent =
            answer;

    }


    if (gameOverlay) {

        gameOverlay.classList.add(
            "show"
        );

    }

}


/* =========================================
   LOSE GAME
========================================= */

function loseGame() {

    gameOver = true;


    showMessage(
        "The word was " +
        answer +
        "."
    );


    if (gameTitle) {

        gameTitle.textContent =
            "Game Over";

    }


    if (gameDescription) {

        gameDescription.textContent =
            "Better luck tomorrow!";

    }


    if (answerDisplay) {

        answerDisplay.textContent =
            "The word was " +
            answer;

    }


    if (gameOverlay) {

        gameOverlay.classList.add(
            "show"
        );

    }

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(message) {

    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;

}


/* =========================================
   HELP
========================================= */

if (
    helpButton &&
    helpOverlay
) {

    helpButton.addEventListener(
        "click",
        function () {

            helpOverlay.classList.add(
                "show"
            );

        }
    );

}


if (
    closeHelpButton &&
    helpOverlay
) {

    closeHelpButton.addEventListener(
        "click",
        function () {

            helpOverlay.classList.remove(
                "show"
            );

        }
    );

}


if (helpOverlay) {

    helpOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                helpOverlay
            ) {

                helpOverlay.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================
   CLOSE WIN / LOSS
========================================= */

if (
    closeGameButton &&
    gameOverlay
) {

    closeGameButton.addEventListener(
        "click",
        function () {

            gameOverlay.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================
   KEYBOARD INPUT
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (gameOver) {
            return;
        }


        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {

            return;

        }


        if (
            /^[a-zA-Z]$/.test(
                event.key
            )
        ) {

            event.preventDefault();


            enterLetter(
                event.key.toUpperCase()
            );


            return;

        }


        if (
            event.key === "Backspace"
        ) {

            event.preventDefault();


            deleteLetter();


            return;

        }


        if (
            event.key === "Enter"
        ) {

            event.preventDefault();


            submitGuess();

        }

    }
);


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPuzzle();

    }
);
