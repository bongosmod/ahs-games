const puzzleUrl = "../puzzles/mini.json";

let puzzle = null;
let selectedCell = null;
let direction = "across";
let gameWon = false;

const gridElement =
    document.getElementById("grid");

const acrossCluesElement =
    document.getElementById("across-clues");

const downCluesElement =
    document.getElementById("down-clues");

const messageElement =
    document.getElementById("message");

const helpButton =
    document.getElementById("help-button");

const helpOverlay =
    document.getElementById("help-overlay");

const closeHelp =
    document.getElementById("close-help");

const gameOverlay =
    document.getElementById("game-overlay");

const playAgainButton =
    document.getElementById("play-again");


/* =========================
   LOAD PUZZLE
   ========================= */

async function loadPuzzle() {

    try {

        const response = await fetch(
            `${puzzleUrl}?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error(
                "Could not load puzzle."
            );
        }

        puzzle = await response.json();

        if (
            !Array.isArray(puzzle.grid) ||
            puzzle.grid.length !== 5
        ) {
            throw new Error(
                "Invalid 5x5 grid."
            );
        }

        for (const row of puzzle.grid) {

            if (
                typeof row !== "string" ||
                !/^[A-Z]{5}$/.test(row)
            ) {
                throw new Error(
                    "Invalid grid row."
                );
            }
        }

        if (
            !Array.isArray(puzzle.clues) ||
            puzzle.clues.length !== 10
        ) {
            throw new Error(
                "Invalid clue list."
            );
        }

        buildGrid();
        buildClues();

        messageElement.textContent = "";

    } catch (error) {

        console.error(error);

        messageElement.textContent =
            "Couldn't load today's puzzle.";
    }
}


/* =========================
   BUILD GRID
   ========================= */

function buildGrid() {

    gridElement.innerHTML = "";

    for (
        let row = 0;
        row < 5;
        row++
    ) {

        for (
            let col = 0;
            col < 5;
            col++
        ) {

            const cell =
                document.createElement(
                    "button"
                );

            cell.className =
                "grid-cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.setAttribute(
                "aria-label",
                `Row ${row + 1}, Column ${col + 1}`
            );

            cell.addEventListener(
                "click",
                () => {

                    handleCellClick(
                        row,
                        col
                    );
                }
            );

            gridElement.appendChild(cell);
        }
    }
}


/* =========================
   BUILD CLUES
   ========================= */

function buildClues() {

    acrossCluesElement.innerHTML = "";
    downCluesElement.innerHTML = "";

    puzzle.clues.forEach(
        clue => {

            const clueButton =
                document.createElement(
                    "button"
                );

            clueButton.className =
                "clue";

            clueButton.dataset.number =
                clue.number;

            clueButton.dataset.direction =
                clue.direction;

            clueButton.innerHTML = `
                <span class="clue-number">
                    ${clue.number}.
                </span>
                <span>
                    ${clue.clue}
                </span>
            `;

            clueButton.addEventListener(
                "click",
                () => {
                    selectClue(clue);
                }
            );

            if (
                clue.direction === "across"
            ) {

                acrossCluesElement.appendChild(
                    clueButton
                );

            } else {

                downCluesElement.appendChild(
                    clueButton
                );
            }
        }
    );
}


/* =========================
   GET CELL
   ========================= */

function getCell(
    row,
    col
) {

    return document.querySelector(
        `.grid-cell[data-row="${row}"][data-col="${col}"]`
    );
}


/* =========================
   CELL CLICK
   ========================= */

function handleCellClick(
    row,
    col
) {

    if (gameWon) {
        return;
    }

    if (
        selectedCell &&
        selectedCell.row === row &&
        selectedCell.col === col
    ) {

        direction =
            direction === "across"
                ? "down"
                : "across";
    }

    selectedCell = {
        row,
        col
    };

    highlightSelection();

    const cell =
        getCell(row, col);

    if (cell) {
        cell.focus();
    }
}


/* =========================
   CLUE CLICK
   ========================= */

function selectClue(clue) {

    if (gameWon) {
        return;
    }

    direction =
        clue.direction;

    /*
        Because this is a completely open
        5x5 grid, every Across and Down
        answer begins on the outside edge.

        Numbers are shared:

        #1 Across / #1 Down
        #2 Across / #2 Down
        #3 Across / #3 Down
        #4 Across / #4 Down
        #5 Across / #5 Down
    */

    const index =
        clue.number - 1;

    let row;
    let col;

    if (
        clue.direction === "across"
    ) {

        row = index;
        col = 0;

    } else {

        row = 0;
        col = index;
    }

    selectedCell = {
        row,
        col
    };

    highlightSelection();

    const cell =
        getCell(row, col);

    if (cell) {
        cell.focus();
    }
}


/* =========================
   HIGHLIGHT CURRENT WORD
   ========================= */

function highlightSelection() {

    document
        .querySelectorAll(".grid-cell")
        .forEach(
            cell => {

                cell.classList.remove(
                    "selected"
                );

                cell.classList.remove(
                    "word-selected"
                );
            }
        );

    if (!selectedCell) {
        return;
    }

    const {
        row,
        col
    } = selectedCell;

    if (
        direction === "across"
    ) {

        for (
            let currentCol = 0;
            currentCol < 5;
            currentCol++
        ) {

            const cell =
                getCell(
                    row,
                    currentCol
                );

            if (cell) {

                cell.classList.add(
                    "word-selected"
                );
            }
        }

    } else {

        for (
            let currentRow = 0;
            currentRow < 5;
            currentRow++
        ) {

            const cell =
                getCell(
                    currentRow,
                    col
                );

            if (cell) {

                cell.classList.add(
                    "word-selected"
                );
            }
        }
    }

    const currentCell =
        getCell(row, col);

    if (currentCell) {

        currentCell.classList.remove(
            "word-selected"
        );

        currentCell.classList.add(
            "selected"
        );
    }
}


/* =========================
   KEYBOARD
   ========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !selectedCell ||
            gameWon
        ) {
            return;
        }

        const {
            row,
            col
        } = selectedCell;


        /* LETTER */

        if (
            event.key.length === 1 &&
            /^[a-zA-Z]$/.test(
                event.key
            )
        ) {

            const cell =
                getCell(row, col);

            cell.textContent =
                event.key.toUpperCase();

            moveForward();

            checkPuzzle();

            event.preventDefault();

            return;
        }


        /* BACKSPACE */

        if (
            event.key === "Backspace"
        ) {

            const cell =
                getCell(row, col);

            if (
                cell.textContent !== ""
            ) {

                cell.textContent = "";

            } else {

                moveBackward();
            }

            event.preventDefault();

            return;
        }


        /* LEFT */

        if (
            event.key === "ArrowLeft"
        ) {

            direction = "across";

            moveTo(
                row,
                Math.max(
                    0,
                    col - 1
                )
            );

            event.preventDefault();
        }


        /* RIGHT */

        else if (
            event.key === "ArrowRight"
        ) {

            direction = "across";

            moveTo(
                row,
                Math.min(
                    4,
                    col + 1
                )
            );

            event.preventDefault();
        }


        /* UP */

        else if (
            event.key === "ArrowUp"
        ) {

            direction = "down";

            moveTo(
                Math.max(
                    0,
                    row - 1
                ),
                col
            );

            event.preventDefault();
        }


        /* DOWN */

        else if (
            event.key === "ArrowDown"
        ) {

            direction = "down";

            moveTo(
                Math.min(
                    4,
                    row + 1
                ),
                col
            );

            event.preventDefault();
        }

        highlightSelection();
    }
);


/* =========================
   MOVE TO CELL
   ========================= */

function moveTo(
    row,
    col
) {

    selectedCell = {
        row,
        col
    };

    highlightSelection();

    const cell =
        getCell(row, col);

    if (cell) {
        cell.focus();
    }
}


/* =========================
   MOVE FORWARD
   ========================= */

function moveForward() {

    if (!selectedCell) {
        return;
    }

    let {
        row,
        col
    } = selectedCell;

    if (
        direction === "across"
    ) {

        if (col < 4) {

            col++;

        } else if (row < 4) {

            row++;
            col = 0;
        }

    } else {

        if (row < 4) {

            row++;

        } else if (col < 4) {

            col++;
            row = 0;
        }
    }

    moveTo(
        row,
        col
    );
}


/* =========================
   MOVE BACKWARD
   ========================= */

function moveBackward() {

    if (!selectedCell) {
        return;
    }

    let {
        row,
        col
    } = selectedCell;

    if (
        direction === "across"
    ) {

        if (col > 0) {

            col--;

        } else if (row > 0) {

            row--;
            col = 4;
        }

    } else {

        if (row > 0) {

            row--;

        } else if (col > 0) {

            col--;
            row = 4;
        }
    }

    moveTo(
        row,
        col
    );
}


/* =========================
   CHECK PUZZLE
   ========================= */

function checkPuzzle() {

    const cells =
        document.querySelectorAll(
            ".grid-cell"
        );

    let completed = true;

    cells.forEach(
        cell => {

            if (
                !cell.textContent
            ) {

                completed = false;
            }
        }
    );

    if (!completed) {
        return;
    }


    let correct = true;


    for (
        let row = 0;
        row < 5;
        row++
    ) {

        for (
            let col = 0;
            col < 5;
            col++
        ) {

            const cell =
                getCell(row, col);

            const expected =
                puzzle.grid[row][col];

            if (
                cell.textContent
                    .toUpperCase()
                !== expected
            ) {

                correct = false;
            }
        }
    }


    if (correct) {

        gameWon = true;

        messageElement.textContent =
            "🎉 You solved The Grid!";

        cells.forEach(
            cell => {

                cell.classList.add(
                    "correct"
                );
            }
        );

        setTimeout(
            () => {

                gameOverlay.classList.add(
                    "show"
                );

            },
            500
        );

    } else {

        messageElement.textContent =
            "Not quite! Check your answers.";
    }
}


/* =========================
   HELP
   ========================= */

helpButton.addEventListener(
    "click",
    () => {

        helpOverlay.classList.add(
            "show"
        );
    }
);


closeHelp.addEventListener(
    "click",
    () => {

        helpOverlay.classList.remove(
            "show"
        );
    }
);


helpOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target === helpOverlay
        ) {

            helpOverlay.classList.remove(
                "show"
            );
        }
    }
);


/* =========================
   WIN SCREEN
   ========================= */

playAgainButton.addEventListener(
    "click",
    () => {

        gameOverlay.classList.remove(
            "show"
        );
    }
);


/* =========================
   START
   ========================= */

loadPuzzle();