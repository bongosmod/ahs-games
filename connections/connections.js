const gameBoard = document.getElementById("game-board");
const submitButton = document.getElementById("submit");
const shuffleButton = document.getElementById("shuffle");
const mistakeDots = document.querySelectorAll(".mistake-dot");
const solvedGroupsContainer = document.getElementById("solved-groups");
const message = document.getElementById("message");
const helpButton = document.getElementById("help-button");
const helpOverlay = document.getElementById("help-overlay");
const closeHelp = document.getElementById("close-help");
const gameOverlay = document.getElementById("game-overlay");
const gameTitle = document.getElementById("game-title");
const gameDescription = document.getElementById("game-description");
const playAgain = document.getElementById("play-again");

let mistakes = 0;
let solvedGroups = [];
let gameFinished = false;
let groups = [];


/* =========================
   LOAD PUZZLE
========================= */

async function loadPuzzle() {

    try {

        const response =
            await fetch("../puzzles/connections.json");

        if (!response.ok) {

            throw new Error(
                "Could not load puzzle."
            );

        }

        const puzzle =
            await response.json();

        groups = puzzle.groups;

        setupGame();

    } catch (error) {

        console.error(error);

        showMessage(
            "Could not load today's puzzle."
        );

    }

}


/* =========================
   SETUP GAME
========================= */

function setupGame() {

    gameBoard.innerHTML = "";

    solvedGroupsContainer.innerHTML = "";

    solvedGroups = [];

    mistakes = 0;

    gameFinished = false;

    submitButton.disabled = false;

    shuffleButton.disabled = false;

    updateMistakes();


    const allWords = [];


    groups.forEach(function (group) {

        group.words.forEach(function (word) {

            allWords.push(word);

        });

    });


    shuffleArray(allWords);


    allWords.forEach(function (wordText) {

        const word =
            document.createElement("button");

        word.className = "word";

        word.textContent = wordText;


        word.addEventListener(
            "click",
            function () {

                if (
                    word.disabled ||
                    gameFinished
                ) {

                    return;

                }


                const selected =
                    document.querySelectorAll(
                        ".word.selected"
                    );


                if (
                    !word.classList.contains(
                        "selected"
                    ) &&
                    selected.length >= 4
                ) {

                    return;

                }


                word.classList.toggle(
                    "selected"
                );

            }
        );


        gameBoard.appendChild(word);

    });

}


/* =========================
   SHUFFLE
========================= */

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        const temp = array[i];

        array[i] = array[randomIndex];

        array[randomIndex] = temp;

    }

}


shuffleButton.addEventListener(
    "click",
    function () {

        if (gameFinished) {

            return;

        }


        const words = [];


        document
            .querySelectorAll(".word")
            .forEach(function (word) {

                if (!word.disabled) {

                    words.push(word);

                }

            });


        shuffleArray(words);


        words.forEach(function (word) {

            gameBoard.appendChild(word);

        });

    }
);


/* =========================
   GET SELECTED WORDS
========================= */

function getSelectedWords() {

    const selected = [];


    document
        .querySelectorAll(".word.selected")
        .forEach(function (word) {

            selected.push(
                word.textContent
            );

        });


    return selected;

}


/* =========================
   CLEAR SELECTION
========================= */

function clearSelection() {

    document
        .querySelectorAll(".word")
        .forEach(function (word) {

            word.classList.remove(
                "selected"
            );

        });

}


/* =========================
   MISTAKES
========================= */

function updateMistakes() {

    mistakeDots.forEach(
        function (dot, index) {

            if (index < mistakes) {

                dot.classList.add("used");

            } else {

                dot.classList.remove("used");

            }

        }
    );

}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

    message.textContent = text;

    message.classList.remove("show");

    void message.offsetWidth;

    message.classList.add("show");

}


/* =========================
   SUBMIT
========================= */

submitButton.addEventListener(
    "click",
    function () {

        if (gameFinished) {

            return;

        }


        const selectedWords =
            getSelectedWords();


        if (selectedWords.length !== 4) {

            showMessage(
                "Select exactly 4 words."
            );

            return;

        }


        /* =========================
           CHECK CORRECT GROUP
        ========================= */

        const matchingGroup =
            groups.find(function (group) {

                return group.words.every(
                    function (word) {

                        return selectedWords.includes(
                            word
                        );

                    }
                );

            });


        if (
            matchingGroup &&
            !solvedGroups.includes(
                matchingGroup
            )
        ) {

            solveGroup(
                matchingGroup
            );

            return;

        }


        /* =========================
           CHECK ONE AWAY
        ========================= */

        const oneAway =
            groups.find(function (group) {

                const matches =
                    selectedWords.filter(
                        function (word) {

                            return group.words.includes(
                                word
                            );

                        }
                    );


                return (
                    matches.length === 3 &&
                    !solvedGroups.includes(
                        group
                    )
                );

            });


        if (oneAway) {

            makeWrongAnimation();

            mistakes++;

            updateMistakes();

            showMessage(
                "One away!"
            );

            clearSelection();


            if (mistakes >= 4) {

                endGame(false);

            }

            return;

        }


        /* =========================
           WRONG
        ========================= */

        makeWrongAnimation();

        mistakes++;

        updateMistakes();

        showMessage(
            "Not quite!"
        );

        clearSelection();


        if (mistakes >= 4) {

            endGame(false);

        }

    }
);


/* =========================
   SOLVE GROUP
========================= */

function solveGroup(group) {

    solvedGroups.push(group);


    const groupCard =
        document.createElement("div");


    /*
        IMPORTANT:

        Use the exact className
        from the AI JSON.
    */

    groupCard.className =
        "solved-group " +
        group.className;


    const title =
        document.createElement("h3");


    title.textContent =
        group.name;


    const words =
        document.createElement("p");


    words.textContent =
        group.words.join(" • ");


    groupCard.appendChild(title);

    groupCard.appendChild(words);


    solvedGroupsContainer.appendChild(
        groupCard
    );


    document
        .querySelectorAll(".word")
        .forEach(function (word) {

            if (
                group.words.includes(
                    word.textContent
                )
            ) {

                word.disabled = true;

                word.classList.remove(
                    "selected"
                );

                word.style.display =
                    "none";

            }

        });


    showMessage(
        "Nice! You found a group!"
    );


    if (
        solvedGroups.length ===
        groups.length
    ) {

        endGame(true);

    }

}


/* =========================
   WRONG ANIMATION
========================= */

function makeWrongAnimation() {

    document
        .querySelectorAll(".word.selected")
        .forEach(function (word) {

            word.classList.add(
                "wrong"
            );


            setTimeout(
                function () {

                    word.classList.remove(
                        "wrong"
                    );

                },
                350
            );

        });

}


/* =========================
   END GAME
========================= */

function endGame(won) {

    gameFinished = true;

    submitButton.disabled = true;

    shuffleButton.disabled = true;


    setTimeout(
        function () {

            if (won) {

                gameTitle.textContent =
                    "You Won! 🎉";

                gameDescription.textContent =
                    "You found all four groups!";

            } else {

                gameTitle.textContent =
                    "Game Over";

                gameDescription.textContent =
                    "Better luck tomorrow!";

            }


            gameOverlay.classList.add(
                "show"
            );

        },
        500
    );

}


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
            event.target === helpOverlay
        ) {

            helpOverlay.classList.remove(
                "show"
            );

        }

    }
);


/* =========================
   START
========================= */

loadPuzzle();