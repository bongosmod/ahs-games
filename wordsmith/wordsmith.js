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
   LOAD DAILY PUZZLE
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
                "Wordsmith puzzle is missing its word."
            );

        }


        answer =
            puzzle.word
                .trim()
                .toUpperCase();


        if (
            answer.length !== WORD_LENGTH ||
            !/^[A-Z]{5}$/.test(answer)
        ) {

            throw new Error(
                "Wordsmith answer must be exactly five letters."
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


    if (gameTitle) {

        gameTitle.textContent =
            "You Won!";

    }


    if (gameDescription) {

        gameDescription.textContent =
            "You found today's word!";

    }


    if (answerDisplay) {

        answerDisplay.textContent = "";

    }


    createBoard();

    createKeyboard();

}


/* =========================================
   CREATE WORDLE BOARD
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

        for (
            let col = 0;
            col < WORD_LENGTH;
            col++
        ) {

            const tile =
                document.createElement("div");


            tile.className =
                "tile";


            tile.dataset.row =
                row;

            tile.dataset.col =
                col;


            boardElement.appendChild(
                tile
            );

        }

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
        function (letters, rowIndex) {

            const rowElement =
                document.createElement("div");


            rowElement.className =
                "keyboard-row";


            /*
                ENTER BUTTON ON THIRD ROW
            */

            if (rowIndex === 2) {

                const enterButton =
                    document.createElement("button");


                enterButton.type =
                    "button";


                enterButton.className =
                    "key wide";


                enterButton.textContent =
                    "ENTER";


                enterButton.addEventListener(
                    "click",
                    submitGuess
                );


                rowElement.appendChild(
                    enterButton
                );

            }


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
                            "key";


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


            /*
                BACKSPACE BUTTON ON THIRD ROW
            */

            if (rowIndex === 2) {

                const backspaceButton =
                    document.createElement("button");


                backspaceButton.type =
                    "button";


                backspaceButton.className =
                    "key wide";


                backspaceButton.textContent =
                    "⌫";


                backspaceButton.addEventListener(
                    "click",
                    deleteLetter
                );


                rowElement.appendChild(
                    backspaceButton
                );

            }


            keyboardElement.appendChild(
                rowElement
            );

        }
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


    currentCol++;


    updateBoard();

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


    const tiles =
        boardElement.querySelectorAll(
            ".tile"
        );


    tiles.forEach(
        function (tile) {

            const row =
                Number(
                    tile.dataset.row
                );


            const col =
                Number(
                    tile.dataset.col
                );


            const letter =
                board[row][col];


            tile.textContent =
                letter;


            tile.classList.remove(
                "filled"
            );


            if (letter !== "") {

                tile.classList.add(
                    "filled"
                );

            }

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
            "absent"
        );


    const remaining =
        answer.split("");


    /*
        FIRST PASS
        Find exact matches.
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
        Find letters that exist
        somewhere else.
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


    /*
        WIN
    */

    if (
        guess === answer
    ) {

        winGame();

        return;

    }


    /*
        NEXT ROW
    */

    currentRow++;

    currentCol = 0;


    /*
        LOSS
    */

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

        const tile =
            boardElement.querySelector(
                '.tile[data-row="' +
                row +
                '"][data-col="' +
                col +
                '"]'
            );


        if (!tile) {
            continue;
        }


        tile.classList.remove(
            "filled"
        );


        tile.classList.add(
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


        /*
            CORRECT IS ALWAYS THE
            STRONGEST RESULT.
        */

        if (
            result[i] === "correct"
        ) {

            button.classList.remove(
                "present",
                "absent"
            );


            button.classList.add(
                "correct"
            );


            continue;

        }


        /*
            PRESENT ONLY OVERRIDES
            ABSENT.
        */

        if (
            result[i] === "present" &&
            !button.classList.contains(
                "correct"
            )
        ) {

            button.classList.remove(
                "absent"
            );


            button.classList.add(
                "present"
            );


            continue;

        }


        /*
            ABSENT ONLY APPLIES IF
            LETTER IS NOT ALREADY
            PRESENT OR CORRECT.
        */

        if (
            result[i] === "absent" &&
            !button.classList.contains(
                "correct"
            ) &&
            !button.classList.contains(
                "present"
            )
        ) {

            button.classList.add(
                "absent"
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
   PHYSICAL KEYBOARD
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


        /*
            LETTER
        */

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


        /*
            BACKSPACE
        */

        if (
            event.key === "Backspace"
        ) {

            event.preventDefault();


            deleteLetter();


            return;

        }


        /*
            ENTER
        */

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
