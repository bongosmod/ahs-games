document.addEventListener("DOMContentLoaded", async () => {

    // ========================================================
    // SETTINGS
    // ========================================================

    const GRID_SIZE = 5;
    const BLACK_SQUARE = "#";

    let puzzle = null;

    let grid = [];

    let userGrid = [];

    let selectedRow = 0;
    let selectedColumn = 0;

    let selectedDirection = "across";

    let completed = false;


    // ========================================================
    // ELEMENTS
    // ========================================================

    const gridElement =
        document.getElementById("mini-grid");

    const acrossCluesElement =
        document.getElementById("across-clues");

    const downCluesElement =
        document.getElementById("down-clues");

    const titleElement =
        document.getElementById("puzzle-title");

    const statusElement =
        document.getElementById("puzzle-status");


    // ========================================================
    // LOAD PUZZLE
    // ========================================================

    async function loadPuzzle() {

        try {

            const response =
                await fetch(
                    "../puzzles/mini.json?" +
                    Date.now()
                );


            if (!response.ok) {

                throw new Error(
                    "Could not load puzzle."
                );

            }


            puzzle =
                await response.json();


            setupPuzzle();


        }

        catch (error) {

            console.error(error);


            if (statusElement) {

                statusElement.textContent =
                    "Couldn't load today's puzzle.";

            }

        }

    }


    // ========================================================
    // SETUP PUZZLE
    // ========================================================

    function setupPuzzle() {

        grid =
            puzzle.grid.map(
                row => [...row]
            );


        userGrid =
            grid.map(
                row =>
                    row.map(
                        cell =>
                            cell === BLACK_SQUARE
                                ? BLACK_SQUARE
                                : ""
                    )
            );


        if (titleElement) {

            titleElement.textContent =
                puzzle.title || "The Grid";

        }


        createGrid();

        createClues();

        updateSelection();

    }


    // ========================================================
    // GET ACROSS ENTRIES
    // ========================================================

    function getAcrossEntries() {

        const entries = [];

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    continue;

                }


                const startsAcross =
                    column === 0 ||
                    grid[row][column - 1] === BLACK_SQUARE;


                const hasNextCell =
                    column + 1 < GRID_SIZE &&
                    grid[row][column + 1] !== BLACK_SQUARE;


                if (
                    startsAcross &&
                    hasNextCell
                ) {

                    entries.push({
                        row,
                        column
                    });

                }

            }

        }


        return entries;

    }


    // ========================================================
    // GET DOWN ENTRIES
    // ========================================================

    function getDownEntries() {

        const entries = [];

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    continue;

                }


                const startsDown =
                    row === 0 ||
                    grid[row - 1][column] === BLACK_SQUARE;


                const hasNextCell =
                    row + 1 < GRID_SIZE &&
                    grid[row + 1][column] !== BLACK_SQUARE;


                if (
                    startsDown &&
                    hasNextCell
                ) {

                    entries.push({
                        row,
                        column
                    });

                }

            }

        }


        return entries;

    }


    // ========================================================
    // NUMBER THE GRID
    // ========================================================

    function getNumberMap() {

        const across =
            getAcrossEntries();

        const down =
            getDownEntries();


        const starts = new Map();


        for (const entry of across) {

            starts.set(
                `${entry.row},${entry.column}`,
                true
            );

        }


        for (const entry of down) {

            starts.set(
                `${entry.row},${entry.column}`,
                true
            );

        }


        const sortedStarts =
            Array.from(
                starts.keys()
            )
                .map(key => {

                    const parts =
                        key.split(",");

                    return {
                        row: Number(parts[0]),
                        column: Number(parts[1])
                    };

                })
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


        return numberMap;

    }


    // ========================================================
    // CREATE GRID
    // ========================================================

    function createGrid() {

        gridElement.innerHTML = "";

        const numberMap =
            getNumberMap();


        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                const cell =
                    document.createElement("button");


                cell.type = "button";

                cell.className =
                    "mini-cell";


                cell.dataset.row =
                    row;

                cell.dataset.column =
                    column;


                // =================================================
                // BLACK SQUARE
                // =================================================

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    cell.classList.add(
                        "black-cell"
                    );


                    cell.disabled = true;


                    gridElement.appendChild(
                        cell
                    );


                    continue;

                }


                // =================================================
                // NUMBER
                // =================================================

                const key =
                    `${row},${column}`;


                if (
                    numberMap.has(key)
                ) {

                    const number =
                        document.createElement("span");


                    number.className =
                        "cell-number";


                    number.textContent =
                        numberMap.get(key);


                    cell.appendChild(
                        number
                    );

                }


                // =================================================
                // LETTER
                // =================================================

                const letter =
                    document.createElement("span");


                letter.className =
                    "cell-letter";


                letter.textContent =
                    userGrid[row][column];


                cell.appendChild(
                    letter
                );


                // =================================================
                // CLICK
                // =================================================

                cell.addEventListener(
                    "click",
                    () => {

                        selectCell(
                            row,
                            column
                        );

                    }
                );


                gridElement.appendChild(
                    cell
                );

            }

        }

    }


    // ========================================================
    // CREATE CLUES
    // ========================================================

    function createClues() {

        acrossCluesElement.innerHTML = "";

        downCluesElement.innerHTML = "";


        const numberMap =
            getNumberMap();


        const acrossClues =
            puzzle.clues.filter(
                clue =>
                    clue.direction === "across"
            );


        const downClues =
            puzzle.clues.filter(
                clue =>
                    clue.direction === "down"
            );


        // ====================================================
        // ACROSS
        // ====================================================

        for (const clue of acrossClues) {

            createClueButton(
                acrossCluesElement,
                clue,
                numberMap
            );

        }


        // ====================================================
        // DOWN
        // ====================================================

        for (const clue of downClues) {

            createClueButton(
                downCluesElement,
                clue,
                numberMap
            );

        }

    }


    // ========================================================
    // CREATE CLUE BUTTON
    // ========================================================

    function createClueButton(
        parent,
        clue,
        numberMap
    ) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "clue";


        button.dataset.number =
            clue.number;

        button.dataset.direction =
            clue.direction;


        const number =
            document.createElement("span");


        number.className =
            "clue-number";


        number.textContent =
            clue.number;


        const text =
            document.createElement("span");


        text.className =
            "clue-text";


        text.textContent =
            clue.clue;


        button.appendChild(number);

        button.appendChild(text);


        button.addEventListener(
            "click",
            () => {

                const start =
                    findClueStart(
                        clue.number,
                        clue.direction,
                        numberMap
                    );


                if (!start) {

                    return;

                }


                selectedDirection =
                    clue.direction;


                selectedRow =
                    start.row;

                selectedColumn =
                    start.column;


                updateSelection();

            }
        );


        parent.appendChild(button);

    }


    // ========================================================
    // FIND CLUE START
    // ========================================================

    function findClueStart(
        number,
        direction,
        numberMap
    ) {

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    continue;

                }


                const key =
                    `${row},${column}`;


                if (
                    numberMap.get(key) !== number
                ) {

                    continue;

                }


                if (
                    direction === "across" &&
                    (
                        column === 0 ||
                        grid[row][column - 1] === BLACK_SQUARE
                    )
                ) {

                    return {
                        row,
                        column
                    };

                }


                if (
                    direction === "down" &&
                    (
                        row === 0 ||
                        grid[row - 1][column] === BLACK_SQUARE
                    )
                ) {

                    return {
                        row,
                        column
                    };

                }

            }

        }


        return null;

    }


    // ========================================================
    // SELECT CELL
    // ========================================================

    function selectCell(row, column) {

        if (
            grid[row][column] === BLACK_SQUARE
        ) {

            return;

        }


        /*
         * Clicking the currently selected cell
         * switches Across <-> Down when both exist.
         */

        if (
            selectedRow === row &&
            selectedColumn === column
        ) {

            const hasAcross =
                cellStartsAcross(
                    row,
                    column
                );


            const hasDown =
                cellStartsDown(
                    row,
                    column
                );


            if (
                hasAcross &&
                hasDown
            ) {

                selectedDirection =
                    selectedDirection === "across"
                        ? "down"
                        : "across";

            }

        }


        selectedRow =
            row;

        selectedColumn =
            column;


        updateSelection();

    }


    // ========================================================
    // CHECK STARTS ACROSS
    // ========================================================

    function cellStartsAcross(row, column) {

        return (
            grid[row][column] !== BLACK_SQUARE &&
            (
                column === 0 ||
                grid[row][column - 1] === BLACK_SQUARE
            ) &&
            column + 1 < GRID_SIZE &&
            grid[row][column + 1] !== BLACK_SQUARE
        );

    }


    // ========================================================
    // CHECK STARTS DOWN
    // ========================================================

    function cellStartsDown(row, column) {

        return (
            grid[row][column] !== BLACK_SQUARE &&
            (
                row === 0 ||
                grid[row - 1][column] === BLACK_SQUARE
            ) &&
            row + 1 < GRID_SIZE &&
            grid[row + 1][column] !== BLACK_SQUARE
        );

    }


    // ========================================================
    // GET CURRENT ENTRY
    // ========================================================

    function getCurrentEntry() {

        let row =
            selectedRow;

        let column =
            selectedColumn;


        if (
            selectedDirection === "across"
        ) {

            while (
                column > 0 &&
                grid[row][column - 1] !== BLACK_SQUARE
            ) {

                column--;

            }

        }

        else {

            while (
                row > 0 &&
                grid[row - 1][column] !== BLACK_SQUARE
            ) {

                row--;

            }

        }


        return {
            row,
            column
        };

    }


    // ========================================================
    // UPDATE SELECTION
    // ========================================================

    function updateSelection() {

        const cells =
            gridElement.querySelectorAll(
                ".mini-cell"
            );


        cells.forEach(cell => {

            cell.classList.remove(
                "selected"
            );

            cell.classList.remove(
                "word-selected"
            );

        });


        const current =
            gridElement.querySelector(
                `[data-row="${selectedRow}"][data-column="${selectedColumn}"]`
            );


        if (current) {

            current.classList.add(
                "selected"
            );

        }


        highlightCurrentWord();

        highlightCurrentClue();

    }


    // ========================================================
    // HIGHLIGHT CURRENT WORD
    // ========================================================

    function highlightCurrentWord() {

        let row =
            selectedRow;

        let column =
            selectedColumn;


        if (
            selectedDirection === "across"
        ) {

            while (
                column > 0 &&
                grid[row][column - 1] !== BLACK_SQUARE
            ) {

                column--;

            }


            while (
                column < GRID_SIZE &&
                grid[row][column] !== BLACK_SQUARE
            ) {

                const cell =
                    gridElement.querySelector(
                        `[data-row="${row}"][data-column="${column}"]`
                    );


                if (cell) {

                    cell.classList.add(
                        "word-selected"
                    );

                }


                column++;

            }

        }

        else {

            while (
                row > 0 &&
                grid[row - 1][column] !== BLACK_SQUARE
            ) {

                row--;

            }


            while (
                row < GRID_SIZE &&
                grid[row][column] !== BLACK_SQUARE
            ) {

                const cell =
                    gridElement.querySelector(
                        `[data-row="${row}"][data-column="${column}"]`
                    );


                if (cell) {

                    cell.classList.add(
                        "word-selected"
                    );

                }


                row++;

            }

        }

    }


    // ========================================================
    // HIGHLIGHT CURRENT CLUE
    // ========================================================

    function highlightCurrentClue() {

        const clues =
            document.querySelectorAll(
                ".clue"
            );


        const number =
            getCurrentClueNumber();


        clues.forEach(clue => {

            clue.classList.remove(
                "active"
            );


            if (
                Number(clue.dataset.number) === number &&
                clue.dataset.direction === selectedDirection
            ) {

                clue.classList.add(
                    "active"
                );

            }

        });

    }


    // ========================================================
    // GET CURRENT CLUE NUMBER
    // ========================================================

    function getCurrentClueNumber() {

        const numberMap =
            getNumberMap();


        const start =
            getCurrentEntry();


        return numberMap.get(
            `${start.row},${start.column}`
        );

    }


    // ========================================================
    // KEYBOARD INPUT
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (completed) {

                return;

            }


            // ================================================
            // LETTER
            // ================================================

            if (
                /^[a-zA-Z]$/.test(event.key)
            ) {

                event.preventDefault();


                userGrid[selectedRow][selectedColumn] =
                    event.key.toUpperCase();


                updateCellLetter();

                moveForward();

                checkCompletion();

                return;

            }


            // ================================================
            // BACKSPACE
            // ================================================

            if (
                event.key === "Backspace"
            ) {

                event.preventDefault();


                if (
                    userGrid[selectedRow][selectedColumn] !== ""
                ) {

                    userGrid[selectedRow][selectedColumn] =
                        "";

                    updateCellLetter();

                }

                else {

                    moveBackward();

                    userGrid[selectedRow][selectedColumn] =
                        "";

                    updateCellLetter();

                }


                return;

            }


            // ================================================
            // ARROW KEYS
            // ================================================

            if (
                event.key === "ArrowLeft"
            ) {

                event.preventDefault();

                moveDirection(
                    0,
                    -1
                );

                return;

            }


            if (
                event.key === "ArrowRight"
            ) {

                event.preventDefault();

                moveDirection(
                    0,
                    1
                );

                return;

            }


            if (
                event.key === "ArrowUp"
            ) {

                event.preventDefault();

                moveDirection(
                    -1,
                    0
                );

                return;

            }


            if (
                event.key === "ArrowDown"
            ) {

                event.preventDefault();

                moveDirection(
                    1,
                    0
                );

                return;

            }


            // ================================================
            // TAB
            // ================================================

            if (
                event.key === "Tab"
            ) {

                event.preventDefault();

                moveForward();

            }

        }
    );


    // ========================================================
    // UPDATE LETTER ON SCREEN
    // ========================================================

    function updateCellLetter() {

        const cell =
            gridElement.querySelector(
                `[data-row="${selectedRow}"][data-column="${selectedColumn}"]`
            );


        if (!cell) {

            return;

        }


        const letter =
            cell.querySelector(
                ".cell-letter"
            );


        if (letter) {

            letter.textContent =
                userGrid[selectedRow][selectedColumn];

        }

    }


    // ========================================================
    // MOVE FORWARD
    // ========================================================

    function moveForward() {

        if (
            selectedDirection === "across"
        ) {

            let column =
                selectedColumn + 1;


            while (
                column < GRID_SIZE &&
                grid[selectedRow][column] === BLACK_SQUARE
            ) {

                column++;

            }


            if (
                column < GRID_SIZE &&
                grid[selectedRow][column] !== BLACK_SQUARE
            ) {

                selectedColumn =
                    column;

            }

            else {

                const start =
                    getCurrentEntry();


                selectedColumn =
                    start.column;

            }

        }

        else {

            let row =
                selectedRow + 1;


            while (
                row < GRID_SIZE &&
                grid[row][selectedColumn] === BLACK_SQUARE
            ) {

                row++;

            }


            if (
                row < GRID_SIZE &&
                grid[row][selectedColumn] !== BLACK_SQUARE
            ) {

                selectedRow =
                    row;

            }

            else {

                const start =
                    getCurrentEntry();


                selectedRow =
                    start.row;

            }

        }


        updateSelection();

    }


    // ========================================================
    // MOVE BACKWARD
    // ========================================================

    function moveBackward() {

        if (
            selectedDirection === "across"
        ) {

            let column =
                selectedColumn - 1;


            while (
                column >= 0 &&
                grid[selectedRow][column] === BLACK_SQUARE
            ) {

                column--;

            }


            if (
                column >= 0 &&
                grid[selectedRow][column] !== BLACK_SQUARE
            ) {

                selectedColumn =
                    column;

            }

        }

        else {

            let row =
                selectedRow - 1;


            while (
                row >= 0 &&
                grid[row][selectedColumn] === BLACK_SQUARE
            ) {

                row--;

            }


            if (
                row >= 0 &&
                grid[row][selectedColumn] !== BLACK_SQUARE
            ) {

                selectedRow =
                    row;

            }

        }


        updateSelection();

    }


    // ========================================================
    // MOVE WITH ARROWS
    // ========================================================

    function moveDirection(
        rowChange,
        columnChange
    ) {

        let row =
            selectedRow + rowChange;

        let column =
            selectedColumn + columnChange;


        if (
            row < 0 ||
            row >= GRID_SIZE ||
            column < 0 ||
            column >= GRID_SIZE
        ) {

            return;

        }


        if (
            grid[row][column] === BLACK_SQUARE
        ) {

            return;

        }


        selectedRow =
            row;

        selectedColumn =
            column;


        if (
            rowChange !== 0
        ) {

            selectedDirection =
                "down";

        }


        if (
            columnChange !== 0
        ) {

            selectedDirection =
                "across";

        }


        updateSelection();

    }


    // ========================================================
    // CHECK COMPLETION
    // ========================================================

    function checkCompletion() {

        for (let row = 0; row < GRID_SIZE; row++) {

            for (
                let column = 0;
                column < GRID_SIZE;
                column++
            ) {

                if (
                    grid[row][column] === BLACK_SQUARE
                ) {

                    continue;

                }


                if (
                    userGrid[row][column] !==
                    grid[row][column]
                ) {

                    return false;

                }

            }

        }


        completed = true;


        if (statusElement) {

            statusElement.textContent =
                "🎉 Puzzle complete!";

        }


        gridElement.classList.add(
            "completed"
        );


        return true;

    }


    // ========================================================
    // START
    // ========================================================

    await loadPuzzle();

});