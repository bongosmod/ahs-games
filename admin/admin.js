document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // SETTINGS
    // ========================================================

    const GRID_SIZE = 5;
    const BLACK_SQUARE = "#";


    // ========================================================
    // ELEMENTS
    // ========================================================

    const gridElement = document.getElementById("grid");
    const acrossCluesElement = document.getElementById("across-clues");
    const downCluesElement = document.getElementById("down-clues");

    const previewButton = document.getElementById("preview-button");
    const generateButton = document.getElementById("generate-button");

    const previewGridElement = document.getElementById("preview-grid");

    const gridStatus = document.getElementById("grid-status");
    const result = document.getElementById("result");


    // ========================================================
    // GRID DATA
    // ========================================================

    const grid = [];

    const clueInputs = {
        across: {},
        down: {}
    };


    // ========================================================
    // CREATE EMPTY GRID
    // ========================================================

    for (let row = 0; row < GRID_SIZE; row++) {

        grid[row] = [];

        for (let column = 0; column < GRID_SIZE; column++) {

            grid[row][column] = "";

        }

    }


    // ========================================================
    // CREATE GRID
    // ========================================================

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

                cell.value = grid[row][column] === BLACK_SQUARE
                    ? ""
                    : grid[row][column];


                // ==========================================
                // BLACK SQUARE
                // ==========================================

                if (grid[row][column] === BLACK_SQUARE) {

                    cell.classList.add("black-cell");

                    cell.value = "";

                    cell.readOnly = true;

                }


                // ==========================================
                // CLICK
                // ==========================================

                cell.addEventListener("click", (event) => {

                    /*
                     * Holding Shift while clicking a cell
                     * makes it a black square.
                     *
                     * Clicking a black square normally
                     * turns it back into a letter.
                     */

                    if (event.shiftKey) {

                        toggleBlackSquare(row, column);

                        return;

                    }

                    if (grid[row][column] === BLACK_SQUARE) {

                        toggleBlackSquare(row, column);

                    }

                });


                // ==========================================
                // DOUBLE CLICK
                // ==========================================

                cell.addEventListener("dblclick", () => {

                    toggleBlackSquare(row, column);

                });


                // ==========================================
                // LETTER INPUT
                // ==========================================

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


                // ==========================================
                // KEYBOARD NAVIGATION
                // ==========================================

                cell.addEventListener("keydown", (event) => {

                    let nextRow = row;

                    let nextColumn = column;


                    if (event.key === "ArrowRight") {

                        nextColumn++;

                    }

                    else if (event.key === "ArrowLeft") {

                        nextColumn--;

                    }

                    else if (event.key === "ArrowDown") {

                        nextRow++;

                    }

                    else if (event.key === "ArrowUp") {

                        nextRow--;

                    }

                    else if (
                        event.key === "Backspace" &&
                        cell.value === ""
                    ) {

                        nextColumn--;

                    }

                    else {

                        return;

                    }


                    event.preventDefault();


                    // Move across rows

                    if (nextColumn >= GRID_SIZE) {

                        nextColumn = 0;

                        nextRow++;

                    }

                    if (nextColumn < 0) {

                        nextColumn = GRID_SIZE - 1;

                        nextRow--;

                    }


                    // Stop at board edges

                    if (
                        nextRow < 0 ||
                        nextRow >= GRID_SIZE ||
                        nextColumn < 0 ||
                        nextColumn >= GRID_SIZE
                    ) {

                        return;

                    }


                    focusCell(
                        nextRow,
                        nextColumn
                    );

                });


                gridElement.appendChild(cell);

            }

        }

    }


    // ========================================================
    // TOGGLE BLACK SQUARE
    // ========================================================

    function toggleBlackSquare(row, column) {

        if (grid[row][column] === BLACK_SQUARE) {

            grid[row][column] = "";

        }

        else {

            grid[row][column] = BLACK_SQUARE;

        }


        createGrid();

        updateClues();

        updatePreview();

        updateStatus();

    }


    // ========================================================
    // FOCUS CELL
    // ========================================================

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


    // ========================================================
    // FIND ACROSS STARTS
    // ========================================================

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


                if (
                    leftIsBlack &&
                    hasAnotherCell
                ) {

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


    // ========================================================
    // FIND DOWN ENTRIES
    // ========================================================

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


                if (
                    aboveIsBlack &&
                    hasAnotherCell
                ) {

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


    // ========================================================
    // GET ALL NUMBERED START CELLS
    // ========================================================

    function getNumberedEntries() {

        const across = getAcrossEntries();

        const down = getDownEntries();


        /*
         * Standard crossword numbering:
         *
         * A cell gets ONE number if it begins either
         * an Across word, a Down word, or both.
         *
         * This prevents weird numbering like:
         *
         * #7 Across
         * #7 Down
         *
         * being generated independently.
         */

        const starts = new Map();


        for (const entry of across) {

            const key =
                `${entry.row},${entry.column}`;


            if (!starts.has(key)) {

                starts.set(
                    key,
                    entry
                );

            }

        }


        for (const entry of down) {

            const key =
                `${entry.row},${entry.column}`;


            if (!starts.has(key)) {

                starts.set(
                    key,
                    entry
                );

            }

        }


        const sortedStarts =
            Array.from(starts.values())
                .sort((a, b) => {

                    if (a.row !== b.row) {

                        return a.row - b.row;

                    }

                    return a.column - b.column;

                });


        const numberMap = new Map();


        sortedStarts.forEach(
            (entry, index) => {

                numberMap.set(
                    `${entry.row},${entry.column}`,
                    index + 1
                );

            }
        );


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


    // ========================================================
    // CREATE CLUE INPUTS
    // ========================================================

    function updateClues() {

        const entries =
            getNumberedEntries();


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


        // ====================================================
        // ACROSS
        // ====================================================

        for (const entry of entries.across) {

            const row =
                document.createElement("div");

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


        // ====================================================
        // DOWN
        // ====================================================

        for (const entry of entries.down) {

            const row =
                document.createElement("div");

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


    // ========================================================
    // GET DATE
    // ========================================================

    function getToday() {

        const now =
            new Date();


        /*
         * Convert the current time to New York time.
         */

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


    // ========================================================
    // GET GRID ANSWERS
    // ========================================================

    function getAcrossAnswers() {

        const entries =
            getNumberedEntries();


        return entries.across.map(
            entry => ({
                number: entry.number,
                answer: entry.answer
            })
        );

    }


    function getDownAnswers() {

        const entries =
            getNumberedEntries();


        return entries.down.map(
            entry => ({
                number: entry.number,
                answer: entry.answer
            })
        );

    }


    // ========================================================
    // VALIDATE GRID
    // ========================================================

    function validateGrid() {

        const entries =
            getNumberedEntries();


        if (
            entries.across.length === 0 &&
            entries.down.length === 0
        ) {

            throw new Error(
                "Your grid does not contain any words."
            );

        }


        // ====================================================
        // CHECK WORD LENGTHS
        // ====================================================

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


        // ====================================================
        // CHECK THAT EVERY NON-BLACK CELL IS FILLED
        // ====================================================

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


        // ====================================================
        // CHECK DUPLICATE ANSWERS
        // ====================================================

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


    // ========================================================
    // VALIDATE CLUES
    // ========================================================

    function validateClues() {

        const entries =
            getNumberedEntries();


        const clues = [];


        // ====================================================
        // ACROSS CLUES
        // ====================================================

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


        // ====================================================
        // DOWN CLUES
        // ====================================================

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


        // ====================================================
        // DUPLICATE CLUES
        // ====================================================

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


    // ========================================================
    // BUILD PUZZLE
    // ========================================================

    function buildPuzzle() {

        validateGrid();

        const clues =
            validateClues();


        return {

            date: getToday(),

            title: "The Grid",

            grid: grid.map(
                row => [...row]
            ),

            clues

        };

    }


    // ========================================================
    // UPDATE STATUS
    // ========================================================

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


        }

        catch (error) {

            gridStatus.textContent =
                error.message;

        }

    }


    // ========================================================
    // UPDATE PREVIEW
    // ========================================================

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

                }

                else {

                    cell.textContent =
                        grid[row][column];

                }


                previewGridElement.appendChild(
                    cell
                );

            }

        }

    }


    // ========================================================
    // PREVIEW BUTTON
    // ========================================================

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


            }

            catch (error) {

                result.textContent =
                    "❌ " + error.message;

            }

        }
    );


    // ========================================================
    // GENERATE JSON
    // ========================================================

    generateButton.addEventListener(
        "click",
        () => {

            result.textContent = "";


            try {

                const puzzle =
                    buildPuzzle();


                const json =
                    JSON.stringify(
                        puzzle,
                        null,
                        4
                    );


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

                link.download =
                    "mini.json";


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


            }

            catch (error) {

                result.textContent =
                    "❌ " + error.message;

            }

        }
    );


    // ========================================================
    // START EDITOR
    // ========================================================

    createGrid();

    updateClues();

    updatePreview();

    updateStatus();

});