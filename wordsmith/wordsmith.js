
/* =========================================
   WORDSMITH CLASSIC MODE
========================================= */

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;


/* =========================================
   TEMPORARY WORD
========================================= */

/*
    This is temporary.

    Later, the AI-generated
    wordsmith.json will replace this.
*/

const ANSWER = "CRANE";


/* =========================================
   GAME VARIABLES
========================================= */

let currentRow = 0;
let currentGuess = "";

let gameOver = false;

let board = [];

let keyboardKeys = {};


/* =========================================
   HTML ELEMENTS
========================================= */

const gameBoard =
    document.getElementById("game-board");

const keyboard =
    document.getElementById("keyboard");

const message =
    document.getElementById("message");

const helpButton =
    document.getElementById("help-button");

const helpOverlay =
    document.getElementById("help-overlay");

const closeHelp =
    document.getElementById("close-help");

const gameOverlay =
    document.getElementById("game-overlay");

const gameTitle =
    document.getElementById("game-title");

const gameDescription =
    document.getElementById("game-description");

const answerDisplay =
    document.getElementById("answer-display");

const closeGame =
    document.getElementById("close-game");


/* =========================================
   CREATE BOARD
========================================= */

function createBoard() {

    gameBoard.innerHTML = "";

    board = [];


    for (
        let row = 0;
        row < MAX_GUESSES;
        row++
    ) {

        board[row] = [];


        for (
            let col = 0;
            col < WORD_LENGTH;
            col++
        ) {

            const tile =
                document.createElement("div");

            tile.className = "tile";


            board[row][col] = tile;

            gameBoard.appendChild(tile);

        }

    }

}


/* =========================================
   KEYBOARD
========================================= */

function createKeyboard() {

    keyboard.innerHTML = "";

    keyboardKeys = {};


    const rows = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
    ];


    rows.forEach(function (rowLetters) {

        const row =
            document.createElement("div");

        row.className =
            "keyboard-row";


        rowLetters.forEach(function (letter) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "key";

            button.textContent =
                letter === "BACK"
                    ? "⌫"
                    : letter;


            if (
                letter === "ENTER" ||
                letter === "BACK"
            ) {

                button.classList.add("wide");

            }


            button.addEventListener(
                "click",
                function () {

                    handleKey(letter);

                }
            );


            keyboardKeys[letter] =
                button;


            row.appendChild(button);

        });


        keyboard.appendChild(row);

    });

}


/* =========================================
   HANDLE KEY
========================================= */

function handleKey(key) {

    if (gameOver) {
        return;
    }


    if (key === "ENTER") {

        submitGuess();

        return;

    }


    if (key === "BACK") {

        removeLetter();

        return;

    }


    if (/^[A-Z]$/.test(key)) {

        addLetter(key);

    }

}


/* =========================================
   ADD LETTER
========================================= */

function addLetter(letter) {

    if (
        currentGuess.length >= WORD_LENGTH
    ) {
        return;
    }


    currentGuess += letter;


    updateCurrentRow();

}


/* =========================================
   REMOVE LETTER
========================================= */

function removeLetter() {

    if (
        currentGuess.length === 0
    ) {
        return;
    }


    currentGuess =
        currentGuess.slice(0, -1);


    updateCurrentRow();

}


/* =========================================
   UPDATE CURRENT ROW
========================================= */

function updateCurrentRow() {

    for (
        let col = 0;
        col < WORD_LENGTH;
        col++
    ) {

        const tile =
            board[currentRow][col];


        tile.textContent =
            currentGuess[col] || "";


        tile.classList.toggle(
            "filled",
            Boolean(currentGuess[col])
        );

    }

}


/* =========================================
   SUBMIT GUESS
========================================= */

function submitGuess() {

    if (
        currentGuess.length !== WORD_LENGTH
    ) {

        showMessage(
            "Not enough letters."
        );

        return;

    }


    const guess =
        currentGuess.toUpperCase();


    /*
        Temporary validation.

        Later we can add a full
        dictionary / allowed-word list.
    */


    checkGuess(guess);

}


/* =========================================
   CHECK GUESS
========================================= */

function checkGuess(guess) {

    const answerLetters =
        ANSWER.split("");

    const guessLetters =
        guess.split("");


    const results =
        Array(WORD_LENGTH).fill(
            "absent"
        );


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
            guessLetters[i] ===
            answerLetters[i]
        ) {

            results[i] =
                "correct";


            answerLetters[i] =
                null;


            guessLetters[i] =
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
            guessLetters[i] === null
        ) {
            continue;
        }


        const index =
            answerLetters.indexOf(
                guessLetters[i]
            );


        if (index !== -1) {

            results[i] =
                "present";


            answerLetters[index] =
                null;

        }

    }


    showGuess(
        guess,
        results
    );


    updateKeyboard(
        guess,
        results
    );


    if (
        guess === ANSWER
    ) {

        winGame();

        return;

    }


    currentRow++;

    currentGuess = "";


    if (
        currentRow >= MAX_GUESSES
    ) {

        loseGame();

    }

}


/* =========================================
   SHOW GUESS
========================================= */

function showGuess(
    guess,
    results
) {

    for (
        let i = 0;
        i < WORD_LENGTH;
        i++
    ) {

        const tile =
            board[currentRow][i];


        tile.textContent =
            guess[i];


        tile.classList.remove(
            "filled"
        );


        tile.classList.add(
            results[i]
        );

    }

}


/* =========================================
   UPDATE KEYBOARD
========================================= */

function updateKeyboard(
    guess,
    results
) {

    for (
        let i = 0;
        i < WORD_LENGTH;
        i++
    ) {

        const letter =
            guess[i];


        const button =
            keyboardKeys[letter];


        if (!button) {
            continue;
        }


        /*
            Correct always wins.

            Present beats absent.
        */

        if (
            results[i] === "correct"
        ) {

            button.classList.remove(
                "present",
                "absent"
            );

            button.classList.add(
                "correct"
            );

        } else if (
            results[i] === "present" &&
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

        } else if (
            results[i] === "absent" &&
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
   WIN
========================================= */

function winGame() {

    gameOver = true;


    showMessage(
        "You found the word!"
    );


    gameTitle.textContent =
        "You Won!";


    gameDescription.textContent =
        "You found today's Wordsmith word!";


    answerDisplay.textContent =
        ANSWER;


    gameOverlay.classList.add(
        "show"
    );

}


/* =========================================
   LOSS
========================================= */

function loseGame() {

    gameOver = true;


    showMessage(
        "Better luck tomorrow."
    );


    gameTitle.textContent =
        "Game Over";


    gameDescription.textContent =
        "The word was:";


    answerDisplay.textContent =
        ANSWER;


    gameOverlay.classList.add(
        "show"
    );

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(text) {

    message.textContent =
        text;


    setTimeout(
        function () {

            if (!gameOver) {

                message.textContent =
                    "";

            }

        },
        2000
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
            /^[a-zA-Z]$/.test(event.key)
        ) {

            event.preventDefault();

            addLetter(
                event.key.toUpperCase()
            );

            return;

        }


        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            submitGuess();

            return;

        }


        if (
            event.key === "Backspace"
        ) {

            event.preventDefault();

            removeLetter();

        }

    }
);


/* =========================================
   HELP
========================================= */

helpButton.addEventListener(
    "click",
    function () {

        helpOverlay.classList.add(
            "show"
        );

    }
);


closeHelp.addEventListener(
    "click",
    function () {

        helpOverlay.classList.remove(
            "show"
        );

    }
);


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


/* =========================================
   CLOSE GAME
========================================= */

closeGame.addEventListener(
    "click",
    function () {

        gameOverlay.classList.remove(
            "show"
        );

    }
);


/* =========================================
   START GAME
========================================= */

createBoard();

createKeyboard();
