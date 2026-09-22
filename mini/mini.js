const crosswordGrid =
    document.getElementById("crossword-grid");

const acrossClues =
    document.getElementById("across-clues");

const downClues =
    document.getElementById("down-clues");

const message =
    document.getElementById("message");

const checkButton =
    document.getElementById("check-button");

const revealButton =
    document.getElementById("reveal-button");

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

const playAgain =
    document.getElementById("play-again");


let puzzle = null;

let cells = [];

let selectedRow = 0;

let selectedCol = 0;

let direction = "across";

let gameFinished = false;


/* =========================
   LOAD PUZZLE
========================= */

async function loadPuzzle() {

    try {

        const response =
            await fetch("../puzzles/mini.json");

        if (!response.ok) {

            throw new Error(
                "Could not load puzzle."
            );

        }

        puzzle =
            await response.json();

        setupPuzzle();

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not load today's puzzle."
        );

    }

}


/* =========================
   SETUP PUZZLE
========================= */

function setupPuzzle() {

    crosswordGrid.innerHTML = "";

    acrossClues.innerHTML = "";

    downClues.innerHTML = "";

    cells = [];

    gameFinished = false;


    const rows =
        puzzle.grid.length;

    const cols =
        puzzle.grid[0].length;


    crosswordGrid.style.gridTemplateColumns =
        `repeat(${cols}, 1fr)`;


    createCells(
        rows,
        cols
    );

    createClues();

    selectFirstCell();

}


/* =========================
   CREATE CELLS
========================= */

function createCells(rows, cols) {

    for (
        let row = 0;
        row < rows;
        row++
    ) {

        cells[row] = [];


        for (
            let col = 0;
            col < cols;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "crossword-cell";


            const letter =
                puzzle.grid[row][col];


            if (letter === "#") {

                cell.classList.add(
                    "block"
                );

                cells[row][col] = null;

                crosswordGrid.appendChild(
                    cell
                );

                continue;

            }


            const number =
                getCellNumber(
                    row,
                    col
                );


            if (number !== null) {

                const numberElement =
                    document.createElement(
                        "span"
                    );

                numberElement.className =
                    "cell-number";

                numberElement.textContent =
                    number;

                cell.appendChild(
                    numberElement
                );

            }


            cell.dataset.row = row;

            cell.dataset.col = col;

            cell.dataset.answer =
                letter.toUpperCase();


            cell.dataset.letter = "";


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

            crosswordGrid.appendChild(
                cell
            );

        }

    }

}


/* =========================
   CELL NUMBER
========================= */

function getCellNumber(row, col) {

    const current =
        puzzle.grid[row][col];


    if (current === "#") {

        return null;

    }


    const startsAcross =
        (
            col === 0 ||
            puzzle.grid[row][col - 1] === "#"
        ) &&
        col + 1 < puzzle.grid[row].length &&
        puzzle.grid[row][col + 1] !== "#";


    const startsDown =
        (
            row === 0 ||
            puzzle.grid[row - 1][col] === "#"
        ) &&
        row + 1 < puzzle.grid.length &&
        puzzle.grid[row + 1][col] !== "#";


    if (
        !startsAcross &&
        !startsDown
    ) {

        return null;

    }


    let number = 0;


    for (
        let r = 0;
        r <= row;
        r++
    ) {

        for (
            let c = 0;
            c < puzzle.grid[r].length;
            c++
        ) {

            const cell =
                puzzle.grid[r][c];


            if (cell === "#") {

                continue;

            }


            const across =
                (
                    c === 0 ||
                    puzzle.grid[r][c - 1] === "#"
                ) &&
                c + 1 < puzzle.grid[r].length &&
                puzzle.grid[r][c + 1] !== "#";


            const down =
                (
                    r === 0 ||
                    puzzle.grid[r - 1][c] === "#"
                ) &&
                r + 1 < puzzle.grid.length &&
                puzzle.grid[r + 1][c] !== "#";


            if (across || down) {

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


/* =========================
   CREATE CLUES
========================= */

function createClues() {

    puzzle.across.forEach(
        function (clue) {

            const clueElement =
                createClueElement(
                    clue
                );

            acrossClues.appendChild(
                clueElement
            );

        }
    );


    puzzle.down.forEach(
        function (clue) {

            const clueElement =
                createClueElement(
                    clue
                );

            downClues.appendChild(
                clueElement
            );

        }
    );

}


/* =========================
   CLUE ELEMENT
========================= */

function createClueElement(clue) {

    const element =
        document.createElement("div");


    element.className =
        "clue";


    element.dataset.number =
        clue.number;


    element.dataset.direction =
        clue.direction;


    const number =
        document.createElement("span");


    number.className =
        "clue-number";


    number.textContent =
        clue.number;


    const text =
        document.createElement("span");


    text.textContent =
        clue.clue;


    element.appendChild(
        number
    );

    element.appendChild(
        text
    );


    element.addEventListener(
        "click",
        function () {

            selectClue(
                clue
            );

        }
    );


    return element;

}


/* =========================
   CELL CLICK
========================= */

function handleCellClick(row, col) {

    if (gameFinished) {

        return;

    }


    if (
        selectedRow === row &&
        selectedCol === col
    ) {

        direction =
            direction === "across"
                ? "down"
                : "across";

    }


    selectedRow = row;

    selectedCol = col;


    selectCell();

}


/* =========================
   SELECT CELL
========================= */

function selectCell() {

    clearHighlights();


    const cell =
        cells[selectedRow][selectedCol];


    if (!cell) {

        return;

    }


    cell.classList.add(
        "active"
    );


    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    wordCells.forEach(
        function (wordCell) {

            wordCell.classList.add(
                "active-word"
            );

        }
    );


    cell.classList.remove(
        "active-word"
    );

    cell.classList.add(
        "active"
    );


    highlightClue();

}


/* =========================
   CLEAR HIGHLIGHTS
========================= */

function clearHighlights() {

    document
        .querySelectorAll(
            ".crossword-cell"
        )
        .forEach(
            function (cell) {

                cell.classList.remove(
                    "active"
                );

                cell.classList.remove(
                    "active-word"
                );

            }
        );


    document
        .querySelectorAll(
            ".clue"
        )
        .forEach(
            function (clue) {

                clue.classList.remove(
                    "active-clue"
                );

            }
        );

}


/* =========================
   GET WORD CELLS
========================= */

function getWordCells(
    row,
    col,
    wordDirection
) {

    const result = [];


    let startRow = row;

    let startCol = col;


    if (
        wordDirection === "across"
    ) {

        while (
            startCol > 0 &&
            puzzle.grid[startRow][
            startCol - 1
            ] !== "#"
        ) {

            startCol--;

        }


        while (
            startCol <
            puzzle.grid[startRow].length &&
            puzzle.grid[startRow][startCol] !== "#"
        ) {

            if (
                cells[startRow][startCol]
            ) {

                result.push(
                    cells[startRow][startCol]
                );

            }

            startCol++;

        }

    } else {

        while (
            startRow > 0 &&
            puzzle.grid[startRow - 1][
            startCol
            ] !== "#"
        ) {

            startRow--;

        }


        while (
            startRow < puzzle.grid.length &&
            puzzle.grid[startRow][startCol] !== "#"
        ) {

            if (
                cells[startRow][startCol]
            ) {

                result.push(
                    cells[startRow][startCol]
                );

            }

            startRow++;

        }

    }


    return result;

}


/* =========================
   HIGHLIGHT CLUE
========================= */

function highlightClue() {

    const number =
        getCurrentClueNumber();


    document
        .querySelectorAll(".clue")
        .forEach(
            function (clue) {

                if (
                    Number(
                        clue.dataset.number
                    ) === number &&
                    clue.dataset.direction ===
                    direction
                ) {

                    clue.classList.add(
                        "active-clue"
                    );

                }

            }
        );

}


/* =========================
   CURRENT CLUE NUMBER
========================= */

function getCurrentClueNumber() {

    let row = selectedRow;

    let col = selectedCol;


    while (
        direction === "across" &&
        col > 0 &&
        puzzle.grid[row][col - 1] !== "#"
    ) {

        col--;

    }


    while (
        direction === "down" &&
        row > 0 &&
        puzzle.grid[row - 1][col] !== "#"
    ) {

        row--;

    }


    return getCellNumber(
        row,
        col
    );

}


/* =========================
   SELECT CLUE
========================= */

function selectClue(clue) {

    direction =
        clue.direction;


    for (
        let row = 0;
        row < puzzle.grid.length;
        row++
    ) {

        for (
            let col = 0;
            col < puzzle.grid[row].length;
            col++
        ) {

            if (
                getCellNumber(
                    row,
                    col
                ) === clue.number
            ) {

                selectedRow = row;

                selectedCol = col;

                selectCell();

                return;

            }

        }

    }

}


/* =========================
   FIRST CELL
========================= */

function selectFirstCell() {

    for (
        let row = 0;
        row < puzzle.grid.length;
        row++
    ) {

        for (
            let col = 0;
            col < puzzle.grid[row].length;
            col++
        ) {

            if (
                cells[row][col]
            ) {

                selectedRow = row;

                selectedCol = col;

                direction = "across";

                selectCell();

                return;

            }

        }

    }

}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            gameFinished ||
            !puzzle
        ) {

            return;

        }


        if (
            event.key.length === 1 &&
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

            eraseLetter();

            return;

        }


        if (
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            moveCell(
                0,
                -1
            );

            direction = "across";

            selectCell();

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            moveCell(
                0,
                1
            );

            direction = "across";

            selectCell();

            return;

        }


        if (
            event.key === "ArrowUp"
        ) {

            event.preventDefault();

            moveCell(
                -1,
                0
            );

            direction = "down";

            selectCell();

            return;

        }


        if (
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            moveCell(
                1,
                0
            );

            direction = "down";

            selectCell();

        }

    }
);


/* =========================
   ENTER LETTER
========================= */

function enterLetter(letter) {

    const cell =
        cells[selectedRow][selectedCol];


    if (!cell) {

        return;

    }


    cell.dataset.letter =
        letter;


    updateCellDisplay(
        cell
    );


    moveForward();

}


/* =========================
   UPDATE DISPLAY
========================= */

function updateCellDisplay(cell) {

    const number =
        cell.querySelector(
            ".cell-number"
        );


    cell.textContent =
        "";


    if (number) {

        cell.appendChild(
            number
        );

    }


    const letterElement =
        document.createElement("span");


    letterElement.textContent =
        cell.dataset.letter;


    cell.appendChild(
        letterElement
    );

}


/* =========================
   ERASE LETTER
========================= */

function eraseLetter() {

    const cell =
        cells[selectedRow][selectedCol];


    if (!cell) {

        return;

    }


    if (
        cell.dataset.letter
    ) {

        cell.dataset.letter = "";

        updateCellDisplay(
            cell
        );

        return;

    }


    moveBackward();

}


/* =========================
   MOVE FORWARD
========================= */

function moveForward() {

    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    const currentIndex =
        wordCells.findIndex(
            function (cell) {

                return (
                    Number(
                        cell.dataset.row
                    ) === selectedRow &&
                    Number(
                        cell.dataset.col
                    ) === selectedCol
                );

            }
        );


    if (
        currentIndex !== -1 &&
        currentIndex <
        wordCells.length - 1
    ) {

        const nextCell =
            wordCells[
            currentIndex + 1
            ];


        selectedRow =
            Number(
                nextCell.dataset.row
            );


        selectedCol =
            Number(
                nextCell.dataset.col
            );


        selectCell();

    }

}


/* =========================
   MOVE BACKWARD
========================= */

function moveBackward() {

    const wordCells =
        getWordCells(
            selectedRow,
            selectedCol,
            direction
        );


    const currentIndex =
        wordCells.findIndex(
            function (cell) {

                return (
                    Number(
                        cell.dataset.row
                    ) === selectedRow &&
                    Number(
                        cell.dataset.col
                    ) === selectedCol
                );

            }
        );


    if (
        currentIndex > 0
    ) {

        const previousCell =
            wordCells[
            currentIndex - 1
            ];


        selectedRow =
            Number(
                previousCell.dataset.row
            );


        selectedCol =
            Number(
                previousCell.dataset.col
            );


        selectCell();

    }

}


/* =========================
   MOVE CELL
========================= */

function moveCell(
    rowChange,
    colChange
) {

    let row =
        selectedRow +
        rowChange;

    let col =
        selectedCol +
        colChange;


    while (
        row >= 0 &&
        row < puzzle.grid.length &&
        col >= 0 &&
        col < puzzle.grid[0].length
    ) {

        if (
            cells[row][col]
        ) {

            selectedRow = row;

            selectedCol = col;

            return;

        }


        row += rowChange;

        col += colChange;

    }

}


/* =========================
   CHECK
========================= */

checkButton.addEventListener(
    "click",
    function () {

        if (
            gameFinished ||
            !puzzle
        ) {

            return;

        }


        let incorrect = 0;

        let empty = 0;


        cells.forEach(
            function (row) {

                row.forEach(
                    function (cell) {

                        if (!cell) {

                            return;

                        }


                        if (
                            !cell.dataset.letter
                        ) {

                            empty++;

                            return;

                        }


                        if (
                            cell.dataset.letter !==
                            cell.dataset.answer
                        ) {

                            incorrect++;

                            cell.classList.add(
                                "wrong"
                            );

                            setTimeout(
                                function () {

                                    cell.classList.remove(
                                        "wrong"
                                    );

                                },
                                400
                            );

                        }

                    }
                );

            }
        );


        if (incorrect > 0) {

            showMessage(
                "Some letters are incorrect."
            );

        } else if (empty > 0) {

            showMessage(
                "Looking good! Keep going."
            );

        } else {

            winGame();

        }

    }
);


/* =========================
   REVEAL
========================= */

revealButton.addEventListener(
    "click",
    function () {

        if (
            gameFinished ||
            !puzzle
        ) {

            return;

        }


        cells.forEach(
            function (row) {

                row.forEach(
                    function (cell) {

                        if (!cell) {

                            return;

                        }


                        cell.dataset.letter =
                            cell.dataset.answer;


                        updateCellDisplay(
                            cell
                        );

                    }
                );

            }
        );


        showMessage(
            "Puzzle revealed!"
        );


        winGame();

    }
);


/* =========================
   WIN
========================= */

function winGame() {

    gameFinished = true;


    setTimeout(
        function () {

            gameTitle.textContent =
                "Puzzle Complete! 🎉";


            gameDescription.textContent =
                "Nice work! Come back tomorrow for a new Mini Crossword.";


            gameOverlay.classList.add(
                "show"
            );

        },
        400
    );

}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

    message.textContent =
        text;

}


/* =========================
   HELP
========================= */

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


/* =========================
   ADMIRE PUZZLE
========================= */

playAgain.addEventListener(
    "click",
    function () {

        gameOverlay.classList.remove(
            "show"
        );

    }
);


/* =========================
   START
========================= */

loadPuzzle();