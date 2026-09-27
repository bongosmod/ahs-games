document.addEventListener("DOMContentLoaded", () => {

    const GRID_SIZE = 5;
    const BLACK_SQUARE = "#";

    const gridElement = document.getElementById("grid");
    const acrossCluesElement = document.getElementById("across-clues");
    const downCluesElement = document.getElementById("down-clues");

    const previewButton = document.getElementById("preview-button");
    const generateButton = document.getElementById("generate-button");

    const previewGridElement = document.getElementById("preview-grid");

    const gridStatus = document.getElementById("grid-status");
    const result = document.getElementById("result");

    /*
    ============================================================
    GRID
    ============================================================
    */

    const grid = [];

    const clueInputs = {
        across: {},
        down: {}
    };

    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];

        for (let column = 0; column < GRID_SIZE; column++) {
            grid[row][column] = "";
        }
    }

    /*
    ============================================================
    CREATE GRID
    ============================================================
    */

    function createGrid() {

        gridElement.innerHTML = "";

        for (let row = 0; row < GRID_SIZE; row++) {

            for (let column = 0; column < GRID_SIZE; column++) {

                const cell = document.createElement("input");

                cell.type = "text";
                cell.className = "grid-cell";
                cell.maxLength = 1;
                cell.autocomplete = "off";

                cell.dataset.row = row;
                cell.dataset.column = column;

                /*
                ------------------------------------------------
                BLACK SQUARE
                ------------------------------------------------
                */

                if (grid[row][column] === BLACK_SQUARE) {

                    cell.classList.add("black-cell");
                    cell.value = "";
                    cell.readOnly = true;

                } else {

                    cell.value = grid[row][column];

                }

                /*
                ------------------------------------------------
                CLICK
                ------------------------------------------------
                */

                cell.addEventListener("click", (event) => {

                    /*
                    Shift-click turns a square black.
                    */

                    if (event.shiftKey) {

                        toggleBlackSquare(row, column);
                        return;

                    }

                    /*
                    Clicking an existing black square turns it
                    back into a normal letter square.
                    */

                    if (grid[row][column] === BLACK_SQUARE) {

                        toggleBlackSquare(row, column);

                    }

                });

                /*
                ------------------------------------------------
                DOUBLE CLICK
                ------------------------------------------------
                */

                cell.addEventListener("dblclick", () => {

                    toggleBlackSquare(row, column);

                });

                /*
                ------------------------------------------------
                INPUT
                ------------------------------------------------
                */

                cell.addEventListener("input", () => {

                    let value = cell.value
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "");

                    value = value.slice(0, 1);

                    cell.value = value;

                    grid[row][column] = value;

                    updateClues();
                    updatePreview();
                    updateStatus();

                });

                /*
                ------------------------------------------------
                KEYBOARD NAVIGATION
                ------------------------------------------------
                */

                cell.addEventListener("keydown", (event) => {

                    let nextRow = row;
                    let nextColumn = column;

                    if (event.key === "ArrowRight") {

                        nextColumn++;

                    } else if (event.key === "ArrowLeft") {

                        nextColumn--;

                    } else if (event.key === "ArrowDown") {

                        nextRow++;

                    } else if (event.key === "ArrowUp") {

                        nextRow--;

                    } else if (
                        event.key === "Backspace" &&
                        cell.value === ""
                    ) {

                        nextColumn--;

                    } else {

                        return;

                    }

                    event.preventDefault();

                    /*
                    Move to next row when going past the
                    right side.
                    */

                    if (nextColumn >= GRID_SIZE) {

                        nextColumn = 0;
                        nextRow++;

                    }

                    /*
                    Move to previous row when going past
                    the left side.
                    */

                    if (nextColumn < 0) {

                        nextColumn = GRID_SIZE - 1;
                        nextRow--;

                    }

                    /*
                    Stop if outside the grid.
                    */

                    if (
                        nextRow < 0 ||
                        nextRow >= GRID_SIZE ||
                        nextColumn < 0 ||
                        nextColumn >= GRID_SIZE
                    ) {

                        return;

                    }

                    focusCell(nextRow, nextColumn);

                });

                gridElement.appendChild(cell);

            }

        }

    }

    /*
    ============================================================
    TOGGLE BLACK SQUARE
    ============================================================
    */

    function toggleBlackSquare(row, column) {

        if (grid[row][column] === BLACK_SQUARE) {

            grid[row][column] = "";

        } else {

            grid[row][column] = BLACK_SQUARE;

        }

        createGrid();
        updateClues();
        updatePreview();
        updateStatus();

    }

    /*
    ============================================================
    FOCUS CELL
    ============================================================
    */

    function focusCell(row, column) {

        const cell = gridElement.querySelector(
            `[data-row="${row}"][data-column="${column}"]`
        );

        if (!cell) {
            return;
        }

        if (cell.classList.contains("black-cell")) {
            return;
        }

        cell.focus();
        cell.select();

    }

    /*
    ============================================================
    GET ACROSS WORDS
    ============================================================
    */

    function getAcrossEntries() {

        const entries = [];
        let number = 0;

        for (let row = 0; row < GRID_SIZE; row++) {

            for (let column = 0; column < GRID_SIZE; column++) {

                if (grid[row][column] === BLACK_SQUARE) {
                    continue;
                }

                const leftIsBlack =
                    column === 0 ||
                    grid[row][column - 1] === BLACK_SQUARE;

                const hasAnotherCell =
                    column + 1 < GRID_SIZE &&
                    grid[row][column + 1] !== BLACK_SQUARE;

                /*
                A word must contain at least two squares.
                */

                if (leftIsBlack && hasAnotherCell) {

                    number++;

                    let answer = "";
                    let currentColumn = column;

                    while (
                        currentColumn < GRID_SIZE &&
                        grid[row][currentColumn] !== BLACK_SQUARE
                    ) {

                        answer +=
                            grid[row][currentColumn] || "";

                        currentColumn++;

                    }

                    entries.push({
                        number,
                        row,
                        column,
                        answer
                    });

                }

            }

        }

        return entries;

    }

    /*
    ============================================================
    GET DOWN WORDS
    ============================================================
    */

    function getDownEntries() {

        const entries = [];
        let number = 0;

        for (let row = 0; row < GRID_SIZE; row++) {

            for (let column = 0; column < GRID_SIZE; column++) {

                if (grid[row][column] === BLACK_SQUARE) {
                    continue;
                }

                const aboveIsBlack =
                    row === 0 ||
                    grid[row - 1][column] === BLACK_SQUARE;

                const hasAnotherCell =
                    row + 1 < GRID_SIZE &&
                    grid[row + 1][column] !== BLACK_SQUARE;

                /*
                A word must contain at least two squares.
                */

                if (aboveIsBlack && hasAnotherCell) {

                    number++;

                    let answer = "";
                    let currentRow = row;

                    while (
                        currentRow < GRID_SIZE &&
                        grid[currentRow][column] !== BLACK_SQUARE
                    ) {

                        answer +=
                            grid[currentRow][column] || "";

                        currentRow++;

                    }

                    entries.push({
                        number,
                        row,
                        column,
                        answer
                    });

                }

            }

        }

        return entries;

    }

    /*
    ============================================================
    STANDARD CROSSWORD NUMBERING
    ============================================================
    */

    function getNumberedEntries() {

        const across = getAcrossEntries();
        const down = getDownEntries();

        const starts = new Map();

        /*
        Find every square where a word begins.
        */

        for (const entry of across) {

            const key =
                `${entry.row},${entry.column}`;

            if (!starts.has(key)) {

                starts.set(key, entry);

            }

        }

        for (const entry of down) {

            const key =
                `${entry.row},${entry.column}`;

            if (!starts.has(key)) {

                starts.set(key, entry);

            }

        }

        /*
        Sort starting squares from top-left to bottom-right.
        */

        const sortedStarts =
            Array.from(starts.values())
                .sort((a, b) => {

                    if (a.row !== b.row) {
                        return a.row - b.row;
                    }

                    return a.column - b.column;

                });

        const numberMap = new Map();

        /*
        Give each starting square ONE number.

        This means a square that begins both Across and Down
        shares the same number.

        Example:

        #1 Across
        #1 Down

        rather than creating separate numbers.
        */

        sortedStarts.forEach((entry, index) => {

            numberMap.set(
                `${entry.row},${entry.column}`,
                index + 1
            );

        });

        for (const entry of across) {

            entry.number =
                numberMap.get(
                    `${entry.row},${entry.column}`
                );

        }

        for (const entry of down) {

            entry.number =
                numberMap.get(
                    `${entry.row},${entry.column}`
                );

        }

        return {
            across,
            down
        };

    }

    /*
    ============================================================
    UPDATE CLUES
    ============================================================
    */

    function updateClues() {

        const entries =
            getNumberedEntries();

        /*
        Save the clues currently typed in.
        */

        const oldAcross = {
            ...clueInputs.across
        };

        const oldDown = {
            ...clueInputs.down
        };

        clueInputs.across = {};
        clueInputs.down = {};

        acrossCluesElement.innerHTML = "";
        downCluesElement.innerHTML = "";

        /*
        --------------------------------------------------------
        ACROSS
        --------------------------------------------------------
        */

        for (const entry of entries.across) {

            const row = document.createElement("div");

            row.className = "clue-row";

            const number =
                document.createElement("span");

            number.textContent =
                entry.number;

            const input =
                document.createElement("input");

            input.type = "text";
            input.className = "clue-input";

            input.placeholder =
                `Clue for ${entry.number} Across`;

            input.value =
                oldAcross[entry.number] || "";

            input.dataset.number =
                entry.number;

            clueInputs.across[entry.number] =
                input;

            row.appendChild(number);
            row.appendChild(input);

            acrossCluesElement.appendChild(row);

        }

        /*
        --------------------------------------------------------
        DOWN
        --------------------------------------------------------
        */

        for (const entry of entries.down) {

            const row = document.createElement("div");

            row.className = "clue-row";

            const number =
                document.createElement("span");

            number.textContent =
                entry.number;

            const input =
                document.createElement("input");

            input.type = "text";
            input.className = "clue-input";

            input.placeholder =
                `Clue for ${entry.number} Down`;

            input.value =
                oldDown[entry.number] || "";

            input.dataset.number =
                entry.number;

            clueInputs.down[entry.number] =
                input;

            row.appendChild(number);
            row.appendChild(input);

            downCluesElement.appendChild(row);

        }

    }

    /*
    ============================================================
    GET TODAY
    ============================================================
    */

    function getToday() {

        const now = new Date();

        const formatter =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "America/New_York",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            );

        return formatter.format(now);

    }

    /*
    ============================================================
    VALIDATE GRID
    ============================================================
    */

    function validateGrid() {

        const entries =
            getNumberedEntries();

        /*
        Make sure there is at least one word.
        */

        if (
            entries.across.length === 0 &&
            entries.down.length === 0
        ) {

            throw new Error(
                "Your grid does not contain any words."
            );

        }

        /*
        Make sure every word is at least two letters.
        */

        for (const entry of entries.across) {

            if (entry.answer.length < 2) {

                throw new Error(
                    `#${entry.number} Across is only ` +
                    `${entry.answer.length} letter(s).`
                );

            }

        }

        for (const entry of entries.down) {

            if (entry.answer.length < 2) {

                throw new Error(
                    `#${entry.number} Down is only ` +
                    `${entry.answer.length} letter(s).`
                );

            }

        }

        /*
        Make sure every non-black square contains
        exactly one letter.
        */

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                const value =
                    grid[row][column];

                if (
                    value !== BLACK_SQUARE &&
                    !/^[A-Z]$/.test(value)
                ) {

                    throw new Error(
                        `Grid square ${row + 1}, ` +
                        `${column + 1} is empty.`
                    );

                }

            }

        }

        /*
        --------------------------------------------------------
        CHECK DUPLICATE ANSWERS
        --------------------------------------------------------
        */

        const answers = [
            ...entries.across.map(
                entry => entry.answer
            ),
            ...entries.down.map(
                entry => entry.answer
            )
        ];

        const completedAnswers =
            answers.filter(
                answer => answer.length > 0
            );

        const duplicates =
            completedAnswers.filter(
                (answer, index) =>
                    completedAnswers.indexOf(answer) !== index
            );

        if (duplicates.length > 0) {

            throw new Error(
                "Duplicate answer found: " +
                duplicates[0]
            );

        }

        return true;

    }

    /*
    ============================================================
    VALIDATE CLUES
    ============================================================
    */

    function validateClues() {

        const entries =
            getNumberedEntries();

        const clues = [];

        /*
        --------------------------------------------------------
        ACROSS CLUES
        --------------------------------------------------------
        */

        for (const entry of entries.across) {

            const input =
                clueInputs.across[entry.number];

            const clue =
                input
                    ? input.value.trim()
                    : "";

            if (!clue) {

                throw new Error(
                    `Missing clue for #${entry.number} Across.`
                );

            }

            clues.push({
                number: entry.number,
                direction: "across",
                clue,
                answer: entry.answer
            });

        }

        /*
        --------------------------------------------------------
        DOWN CLUES
        --------------------------------------------------------
        */

        for (const entry of entries.down) {

            const input =
                clueInputs.down[entry.number];

            const clue =
                input
                    ? input.value.trim()
                    : "";

            if (!clue) {

                throw new Error(
                    `Missing clue for #${entry.number} Down.`
                );

            }

            clues.push({
                number: entry.number,
                direction: "down",
                clue,
                answer: entry.answer
            });

        }

        /*
        --------------------------------------------------------
        CHECK FOR DUPLICATE CLUES
        --------------------------------------------------------
        */

        const clueTexts =
            clues.map(
                clue =>
                    clue.clue
                        .toLowerCase()
                        .trim()
            );

        const uniqueClues =
            new Set(clueTexts);

        if (
            uniqueClues.size !== clueTexts.length
        ) {

            throw new Error(
                "Two clues are identical."
            );

        }

        return clues;

    }

    /*
    ============================================================
    BUILD PUZZLE
    ============================================================
    */

    function buildPuzzle() {

        validateGrid();

        const clues =
            validateClues();

        /*
        IMPORTANT:
        Convert each grid row from:

        ["A", "R", "E", "T", "E"]

        into:

        "ARETE"

        This is the format your Mini Crossword game expects.
        */

        const formattedGrid =
            grid.map(row => row.join(""));

        return {
            date: getToday(),
            title: "The Grid",
            grid: formattedGrid,
            clues
        };

    }

    /*
    ============================================================
    UPDATE STATUS
    ============================================================
    */

    function updateStatus() {

        try {

            const entries =
                getNumberedEntries();

            const filled =
                grid.flat().filter(
                    cell =>
                        cell !== "" &&
                        cell !== BLACK_SQUARE
                ).length;

            const black =
                grid.flat().filter(
                    cell =>
                        cell === BLACK_SQUARE
                ).length;

            gridStatus.textContent =
                `${filled}/25 letters • ` +
                `${black} black squares • ` +
                `${entries.across.length} Across • ` +
                `${entries.down.length} Down`;

        } catch (error) {

            gridStatus.textContent =
                error.message;

        }

    }

    /*
    ============================================================
    UPDATE PREVIEW
    ============================================================
    */

    function updatePreview() {

        previewGridElement.innerHTML = "";

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                const cell =
                    document.createElement("div");

                cell.className =
                    "preview-cell";

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    cell.classList.add(
                        "black-cell"
                    );

                } else {

                    cell.textContent =
                        grid[row][column];

                }

                previewGridElement.appendChild(
                    cell
                );

            }

        }

    }

    /*
    ============================================================
    PREVIEW BUTTON
    ============================================================
    */

    previewButton.addEventListener(
        "click",
        () => {

            try {

                const puzzle =
                    buildPuzzle();

                updatePreview();

                result.textContent =
                    "Preview looks valid! " +
                    `${puzzle.clues.length} clues ready.`;

            } catch (error) {

                result.textContent =
                    "❌ " + error.message;

            }

        }
    );

    /*
    ============================================================
    GENERATE MINI.JSON
    ============================================================
    */

    generateButton.addEventListener(
        "click",
        () => {

            result.textContent = "";

            try {

                const puzzle =
                    buildPuzzle();

                /*
                Convert the puzzle object into formatted JSON.
                */

                const json =
                    JSON.stringify(
                        puzzle,
                        null,
                        4
                    );

                /*
                Create the downloadable file.
                */

                const blob =
                    new Blob(
                        [json],
                        {
                            type: "application/json"
                        }
                    );

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement("a");

                link.href = url;
                link.download = "mini.json";

                document.body.appendChild(
                    link
                );

                link.click();

                document.body.removeChild(
                    link
                );

                URL.revokeObjectURL(
                    url
                );

                result.textContent =
                    "✅ mini.json generated successfully!";

            } catch (error) {

                result.textContent =
                    "❌ " + error.message;

            }

        }
    );

    /*
    ============================================================
    INITIALIZE
    ============================================================
    */

    createGrid();
    updateClues();
    updatePreview();
    updateStatus();

});