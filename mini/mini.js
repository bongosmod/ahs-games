
const GRID_SIZE = 5;


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://wwtlupmofwvryoslptdq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_YmDkQ9n4mnyVFXT58RGR2g_g-ccUB0X";


/* =========================================
   GAME VARIABLES
========================================= */

let puzzle = null;
let answerGrid = [];
let playerGrid = [];
let cells = [];

let selectedRow = 0;
let selectedCol = 0;
let direction = "across";
let puzzleComplete = false;


/* =========================================
   HTML ELEMENTS
========================================= */

const gridElement =
    document.getElementById("grid");

const messageElement =
    document.getElementById("message");

const acrossCluesElement =
    document.getElementById("across-clues");

const downCluesElement =
    document.getElementById("down-clues");

const checkAnswersButton =
    document.getElementById("check-answers");

const helpButton =
    document.getElementById("help-button");

const helpOverlay =
    document.getElementById("help-overlay");

const closeHelpButton =
    document.getElementById("close-help");

const gameOverlay =
    document.getElementById("game-overlay");

const playAgainButton =
    document.getElementById("play-again");

const gameTitle =
    document.getElementById("game-title");

const gameDescription =
    document.getElementById("game-description");


/* =========================================
   LOAD PUZZLE
========================================= */

async function loadPuzzle() {

    try {

        const response = await fetch(
            "../puzzles/mini.json?timestamp=" +
            Date.now()
        );

        if (!response.ok) {
            throw new Error(
                "Could not load puzzle."
            );
        }

        puzzle = await response.json();

        setupPuzzle();

    } catch (error) {

        console.error(error);

        if (messageElement) {

            messageElement.textContent =
                "Couldn't load today's puzzle.";

        }

    }
}


/* =========================================
   SETUP PUZZLE
========================================= */

function setupPuzzle() {

    if (
        !puzzle ||
        !Array.isArray(puzzle.grid)
    ) {

        messageElement.textContent =
            "This puzzle has an invalid grid.";

        return;
    }


    answerGrid =
        puzzle.grid.map(function (row) {

            if (typeof row === "string") {

                return row
                    .toUpperCase()
                    .split("");

            }

            return row.map(function (cell) {

                return String(cell)
                    .toUpperCase();

            });

        });


    if (
        answerGrid.length !== GRID_SIZE ||
        answerGrid.some(function (row) {

            return row.length !== GRID_SIZE;

        })
    ) {

        messageElement.textContent =
            "This puzzle must be a 5×5 grid.";

        return;
    }


    playerGrid =
        answerGrid.map(function (row) {

            return row.map(function (cell) {

                if (cell === "#") {
                    return "#";
                }

                return "";

            });

        });


    cells = [];

    selectedRow = 0;
    selectedCol = 0;

    direction = "across";

    puzzleComplete = false;

    messageElement.textContent = "";


    createGrid();

    createClues();

    selectFirstCell();

}


/* =========================================
   CREATE GRID
========================================= */

function createGrid() {

    gridElement.innerHTML = "";

    cells = [];


    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        cells[row] = [];


        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            const cell =
                document.createElement("button");


            cell.type = "button";

            cell.className =
                "mini-cell";


            /* BLACK SQUARE */

            if (
                answerGrid[row][col] === "#"
            ) {

                cell.classList.add("black");

                cell.disabled = true;

                cells[row][col] = cell;

                gridElement.appendChild(cell);

                continue;
            }


            /* NUMBER */

            const number =
                getCellNumber(row, col);


            if (number !== null) {

                const numberElement =
                    document.createElement("span");

                numberElement.className =
                    "cell-number";

                numberElement.textContent =
                    number;

                cell.appendChild(
                    numberElement
                );

            }


            /* LETTER */

            const letterElement =
                document.createElement("span");

            letterElement.className =
                "cell-letter";

            cell.appendChild(
                letterElement
            );


            /* CLICK */

            cell.addEventListener(
                "click",
                function () {

                    handleCellClick(
                        row,
                        col
                    );

                }
            );


            cells[row][col] = cell;

            gridElement.appendChild(cell);

        }

    }

}


/* =========================================
   CROSSWORD NUMBERING
========================================= */

function getCellNumber(row, col) {

    if (
        answerGrid[row][col] === "#"
    ) {
        return null;
    }


    const startsAcross =
        col === 0 ||
        answerGrid[row][col - 1] === "#";


    const startsDown =
        row === 0 ||
        answerGrid[row - 1][col] === "#";


    if (
        !startsAcross &&
        !startsDown
    ) {
        return null;
    }


    let number = 0;


    for (
        let r = 0;
        r < GRID_SIZE;
        r++
    ) {

        for (
            let c = 0;
            c < GRID_SIZE;
            c++
        ) {

            if (
                answerGrid[r][c] === "#"
            ) {
                continue;
            }


            const across =
                c === 0 ||
                answerGrid[r][c - 1] === "#";


            const down =
                r === 0 ||
                answerGrid[r - 1][c] === "#";


            if (
                across ||
                down
            ) {
                number++;
            }


            if (
                r === row &&
                c === col
            ) {

                return number;

            }

        }

    }


    return null;

}


/* =========================================
   CREATE CLUES
========================================= */

function createClues() {

    acrossCluesElement.innerHTML = "";

    downCluesElement.innerHTML = "";


    if (
        !Array.isArray(puzzle.clues)
    ) {
        return;
    }


    puzzle.clues.forEach(
        function (clue) {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className = "clue";


            button.dataset.number =
                clue.number;

            button.dataset.direction =
                clue.direction;


            const numberSpan =
                document.createElement("span");

            numberSpan.className =
                "clue-number";

            numberSpan.textContent =
                clue.number + ".";


            button.appendChild(
                numberSpan
            );


            button.appendChild(
                document.createTextNode(
                    " " + clue.clue
                )
            );


            button.addEventListener(
                "click",
                function () {

                    selectClue(clue);

                }
            );


            if (
                clue.direction === "across"
            ) {

                acrossCluesElement.appendChild(
                    button
                );

            }


            if (
                clue.direction === "down"
            ) {

                downCluesElement.appendChild(
                    button
                );

            }

        }
    );

}


/* =========================================
   CELL CLICK
========================================= */

function handleCellClick(row, col) {

    if (
        answerGrid[row][col] === "#"
    ) {
        return;
    }


    if (
        selectedRow === row &&
        selectedCol === col
    ) {

        const otherDirection =
            direction === "across"
                ? "down"
                : "across";


        if (
            getWordCells(
                row,
                col,
                otherDirection
            ).length > 1
        ) {

            direction =
                otherDirection;

        }

    } else {

        selectedRow = row;

        selectedCol = col;

    }


    updateSelection();

}


/* =========================================
   FIRST CELL
========================================= */

function selectFirstCell() {

    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (
                answerGrid[row][col] !== "#"
            ) {

                selectedRow = row;

                selectedCol = col;

                direction = "across";

                updateSelection();

                return;

            }

        }

    }

}


/* =========================================
   SELECT CLUE
========================================= */

function selectClue(clue) {

    const number =
        Number(clue.number);


    direction =
        clue.direction;


    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (
                answerGrid[row][col] === "#"
            ) {
                continue;
            }


            if (
                getCellNumber(row, col) !==
                number
            ) {
                continue;
            }


            if (
                clue.direction === "across" &&
                isAcrossStart(row, col)
            ) {

                selectedRow = row;

                selectedCol = col;

                updateSelection();

                return;

            }


            if (
                clue.direction === "down" &&
                isDownStart(row, col)
            ) {

                selectedRow = row;

                selectedCol = col;

                updateSelection();

                return;

            }

        }

    }

}


/* =========================================
   WORD START CHECKS
========================================= */

function isAcrossStart(row, col) {

    return (
        answerGrid[row][col] !== "#" &&
        (
            col === 0 ||
            answerGrid[row][col - 1] === "#"
        )
    );

}


function isDownStart(row, col) {

    return (
        answerGrid[row][col] !== "#" &&
        (
            row === 0 ||
            answerGrid[row - 1][col] === "#"
        )
    );

}


/* =========================================
   UPDATE SELECTION
========================================= */

function updateSelection() {

    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (!cells[row][col]) {
                continue;
            }


            cells[row][col]
                .classList.remove(
                    "selected"
                );


            cells[row][col]
                .classList.remove(
                    "word-selected"
                );

        }

    }


    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    wordCells.forEach(
        function (position) {

            cells[
                position.row
            ][
                position.col
            ].classList.add(
                "word-selected"
            );

        }
    );


    cells[selectedRow][selectedCol]
        .classList.add("selected");


    document
        .querySelectorAll(".clue")
        .forEach(function (clue) {

            clue.classList.remove(
                "active"
            );

        });


    const number =
        getCellNumber(
            selectedRow,
            selectedCol
        );


    const activeClue =
        document.querySelector(
            '.clue[data-number="' +
            number +
            '"][data-direction="' +
            direction +
            '"]'
        );


    if (activeClue) {

        activeClue.classList.add(
            "active"
        );

    }

}


/* =========================================
   GET WORD CELLS
========================================= */

function getWordCells(
    row,
    col,
    wordDirection
) {

    const result = [];


    if (
        answerGrid[row][col] === "#"
    ) {
        return result;
    }


    if (
        wordDirection === "across"
    ) {

        let startCol = col;


        while (
            startCol > 0 &&
            answerGrid[row][startCol - 1] !== "#"
        ) {

            startCol--;

        }


        let currentCol = startCol;


        while (
            currentCol < GRID_SIZE &&
            answerGrid[row][currentCol] !== "#"
        ) {

            result.push({
                row: row,
                col: currentCol
            });


            currentCol++;

        }

    } else {

        let startRow = row;


        while (
            startRow > 0 &&
            answerGrid[startRow - 1][col] !== "#"
        ) {

            startRow--;

        }


        let currentRow = startRow;


        while (
            currentRow < GRID_SIZE &&
            answerGrid[currentRow][col] !== "#"
        ) {

            result.push({
                row: currentRow,
                col: col
            });


            currentRow++;

        }

    }


    return result;

}


/* =========================================
   ENTER LETTER
========================================= */

function enterLetter(letter) {

    if (puzzleComplete) {
        return;
    }


    if (
        answerGrid[selectedRow][selectedCol] === "#"
    ) {
        return;
    }


    playerGrid[selectedRow][selectedCol] =
        letter;


    cells[selectedRow][selectedCol]
        .classList.remove(
            "incorrect"
        );


    messageElement.textContent = "";


    updateLetterDisplay();

    moveForward();

}


/* =========================================
   UPDATE LETTER DISPLAY
========================================= */

function updateLetterDisplay() {

    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (!cells[row][col]) {
                continue;
            }


            const letterElement =
                cells[row][col]
                    .querySelector(
                        ".cell-letter"
                    );


            if (letterElement) {

                letterElement.textContent =
                    playerGrid[row][col];

            }

        }

    }

}


/* =========================================
   DELETE LETTER
========================================= */

function deleteLetter() {

    if (puzzleComplete) {
        return;
    }


    if (
        playerGrid[selectedRow][selectedCol] !== ""
    ) {

        playerGrid[selectedRow][selectedCol] =
            "";


        cells[selectedRow][selectedCol]
            .classList.remove(
                "incorrect"
            );


        updateLetterDisplay();

        return;

    }


    moveBackward();


    playerGrid[selectedRow][selectedCol] =
        "";


    cells[selectedRow][selectedCol]
        .classList.remove(
            "incorrect"
        );


    updateLetterDisplay();

}


/* =========================================
   MOVE FORWARD
========================================= */

function moveForward() {

    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    const currentIndex =
        wordCells.findIndex(
            function (position) {

                return (
                    position.row ===
                        selectedRow &&
                    position.col ===
                        selectedCol
                );

            }
        );


    if (
        currentIndex >= 0 &&
        currentIndex <
            wordCells.length - 1
    ) {

        const next =
            wordCells[
                currentIndex + 1
            ];


        selectedRow = next.row;

        selectedCol = next.col;


        updateSelection();

    }

}


/* =========================================
   MOVE BACKWARD
========================================= */

function moveBackward() {

    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    const currentIndex =
        wordCells.findIndex(
            function (position) {

                return (
                    position.row ===
                        selectedRow &&
                    position.col ===
                        selectedCol
                );

            }
        );


    if (currentIndex > 0) {

        const previous =
            wordCells[
                currentIndex - 1
            ];


        selectedRow =
            previous.row;

        selectedCol =
            previous.col;


        updateSelection();

    }

}


/* =========================================
   ARROW MOVEMENT
========================================= */

function moveSelection(
    rowChange,
    colChange
) {

    let row =
        selectedRow + rowChange;

    let col =
        selectedCol + colChange;


    while (
        row >= 0 &&
        row < GRID_SIZE &&
        col >= 0 &&
        col < GRID_SIZE
    ) {

        if (
            answerGrid[row][col] !== "#"
        ) {

            selectedRow = row;

            selectedCol = col;


            if (rowChange !== 0) {
                direction = "down";
            }


            if (colChange !== 0) {
                direction = "across";
            }


            updateSelection();

            return;

        }


        row += rowChange;

        col += colChange;

    }

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (puzzleComplete) {
            return;
        }


        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }


        if (
            /^[a-zA-Z]$/.test(event.key)
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
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            moveSelection(0, -1);

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            moveSelection(0, 1);

            return;

        }


        if (
            event.key === "ArrowUp"
        ) {

            event.preventDefault();

            moveSelection(-1, 0);

            return;

        }


        if (
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            moveSelection(1, 0);

            return;

        }


        if (event.key === " ") {

            event.preventDefault();


            const otherDirection =
                direction === "across"
                    ? "down"
                    : "across";


            if (
                getWordCells(
                    selectedRow,
                    selectedCol,
                    otherDirection
                ).length > 1
            ) {

                direction =
                    otherDirection;

                updateSelection();

            }

        }

    }
);


/* =========================================
   CHECK ANSWERS
========================================= */

if (checkAnswersButton) {

    checkAnswersButton.addEventListener(
        "click",
        checkAnswers
    );

}


function checkAnswers() {

    if (puzzleComplete) {
        return;
    }


    let allCorrect = true;

    let allFilled = true;


    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (
                answerGrid[row][col] === "#"
            ) {
                continue;
            }


            const playerLetter =
                playerGrid[row][col];


            const correctLetter =
                answerGrid[row][col];


            const cell =
                cells[row][col];


            cell.classList.remove(
                "incorrect"
            );


            if (
                playerLetter === ""
            ) {

                allFilled = false;

                allCorrect = false;

                continue;

            }


            if (
                playerLetter !== correctLetter
            ) {

                allCorrect = false;

                cell.classList.add(
                    "incorrect"
                );

            }

        }

    }


    if (
        allCorrect &&
        allFilled
    ) {

        completePuzzle();

        return;

    }


    if (!allCorrect) {

        messageElement.textContent =
            "Some answers are incorrect.";

        return;

    }


    messageElement.textContent =
        "So far, so good! Keep going.";

}


/* =========================================
   SUPABASE COMPLETION COUNTER
========================================= */

async function updateCompletionCounter() {

    if (
        !puzzle ||
        !puzzle.date
    ) {

        console.error(
            "Could not update completion count: puzzle date missing."
        );

        return;

    }


    const puzzleDate =
        puzzle.date;


    const storageKey =
        "ahs-games-mini-completed-" +
        puzzleDate;


    /*
        Prevent this browser from counting
        the same puzzle more than once.
    */

    if (
        localStorage.getItem(storageKey) === "true"
    ) {

        console.log(
            "This browser already counted today's completion."
        );

        await getCompletionCount(puzzleDate);

        return;

    }


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/rpc/increment_daily_completion",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    },

                    body: JSON.stringify({
                        target_date:
                            puzzleDate
                    })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                "Supabase error: " +
                errorText
            );

        }


        const result =
            await response.json();


        /*
            Mark this puzzle as completed
            on this browser.
        */

        localStorage.setItem(
            storageKey,
            "true"
        );


        displayCompletionCount(
            result
        );


    } catch (error) {

        console.error(
            "Could not update completion counter:",
            error
        );


        /*
            If the counter fails, the puzzle
            still works normally.
        */

        displayCompletionCount(
            null
        );

    }

}


/* =========================================
   GET CURRENT COMPLETION COUNT
========================================= */

async function getCompletionCount(
    puzzleDate
) {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/daily_completions" +
                "?puzzle_date=eq." +
                encodeURIComponent(
                    puzzleDate
                ) +
                "&select=completion_count",
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not retrieve completion count."
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {

            displayCompletionCount(
                data[0].completion_count
            );

        } else {

            displayCompletionCount(0);

        }

    } catch (error) {

        console.error(
            "Could not get completion count:",
            error
        );


        displayCompletionCount(
            null
        );

    }

}


/* =========================================
   DISPLAY COMPLETION COUNT
========================================= */

function displayCompletionCount(
    count
) {

    if (!gameOverlay) {
        return;
    }


    let counterElement =
        document.getElementById(
            "completion-counter"
        );


    /*
        Create the counter automatically
        so we don't have to change mini/index.html.
    */

    if (!counterElement) {

        counterElement =
            document.createElement("p");

        counterElement.id =
            "completion-counter";


        counterElement.style.margin =
            "12px 0 0";


        counterElement.style.color =
            "#cdbd91";


        counterElement.style.fontSize =
            "14px";


        counterElement.style.fontWeight =
            "600";


        if (gameDescription) {

            gameDescription.insertAdjacentElement(
                "afterend",
                counterElement
            );

        } else {

            gameOverlay
                .querySelector(".modal")
                .appendChild(
                    counterElement
                );

        }

    }


    if (
        count === null ||
        count === undefined
    ) {

        counterElement.textContent =
            "Today's completion count is unavailable.";

        return;

    }


    const numericCount =
        Number(count);


    if (
        Number.isNaN(numericCount)
    ) {

        counterElement.textContent =
            "Today's completion count is unavailable.";

        return;

    }


    counterElement.textContent =
        numericCount.toLocaleString() +
        " people completed today's puzzle aswell!";

}


/* =========================================
   COMPLETE PUZZLE
========================================= */

function completePuzzle() {

    puzzleComplete = true;


    messageElement.textContent =
        "Puzzle complete!";


    for (
        let row = 0;
        row < GRID_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < GRID_SIZE;
            col++
        ) {

            if (
                answerGrid[row][col] === "#"
            ) {
                continue;
            }


            cells[row][col]
                .classList.add(
                    "completed"
                );

        }

    }


    if (gameTitle) {

        gameTitle.textContent =
            "You Won!";

    }


    if (gameDescription) {

        gameDescription.textContent =
            "You completed The Grid!";

    }


    if (gameOverlay) {

        gameOverlay.classList.add(
            "show"
        );

    }


    /*
        Update the global completion count
        after the win screen appears.
    */

    updateCompletionCounter();

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
   WIN OVERLAY
========================================= */

if (
    playAgainButton &&
    gameOverlay
) {

    playAgainButton.addEventListener(
        "click",
        function () {

            gameOverlay.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPuzzle();

    }
);
