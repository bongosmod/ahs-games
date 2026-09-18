const gameBoard = document.getElementById("game-board");

const submitButton = document.getElementById("submit");

const shuffleButton = document.getElementById("shuffle");

const mistakeDots =
    document.querySelectorAll(".mistake-dot");

const solvedGroupsContainer =
    document.getElementById("solved-groups");

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

const playAgain =
    document.getElementById("play-again");


let mistakes = 0;

let solvedGroups = [];

let gameFinished = false;


/* =========================
   PUZZLE
========================= */

const groups = [

    {
        name: "FRUITS",

        words: [
            "APPLE",
            "BANANA",
            "ORANGE",
            "PEAR"
        ],

        className: "group-fruit"
    },


    {
        name: "COLORS",

        words: [
            "RED",
            "BLUE",
            "GREEN",
            "YELLOW"
        ],

        className: "group-colors"
    },


    {
        name: "ANIMALS",

        words: [
            "DOG",
            "CAT",
            "HORSE",
            "COW"
        ],

        className: "group-animals"
    },


    {
        name: "NUMBERS",

        words: [
            "ONE",
            "TWO",
            "THREE",
            "FOUR"
        ],

        className: "group-numbers"
    }

];


/* =========================
   SETUP
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


    groups.forEach(group => {

        group.words.forEach(word => {

            allWords.push(word);

        });

    });


    shuffleArray(allWords);


    allWords.forEach(wordText => {

        const word =
            document.createElement("button");

        word.className = "word";

        word.textContent = wordText;


        word.addEventListener("click", () => {

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


            /* Don't allow more than 4 */

            if (
                !word.classList.contains("selected") &&
                selected.length >= 4
            ) {

                return;

            }


            word.classList.toggle("selected");

        });


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


        [
            array[i],
            array[randomIndex]
        ] =
            [
                array[randomIndex],
                array[i]
            ];

    }

}


shuffleButton.addEventListener(
    "click",
    () => {

        if (gameFinished) {
            return;
        }


        const words = [];


        document
            .querySelectorAll(".word")
            .forEach(word => {

                if (!word.disabled) {

                    words.push(word);

                }

            });


        shuffleArray(words);


        words.forEach(word => {

            gameBoard.appendChild(word);

        });

    }
);


/* =========================
   SELECTED WORDS
========================= */

function getSelectedWords() {

    const selected = [];


    document
        .querySelectorAll(".word.selected")
        .forEach(word => {

            selected.push(word.textContent);

        });


    return selected;

}


/* =========================
   CLEAR SELECTION
========================= */

function clearSelection() {

    document
        .querySelectorAll(".word")
        .forEach(word => {

            word.classList.remove("selected");

        });

}


/* =========================
   MISTAKES
========================= */

function updateMistakes() {

    mistakeDots.forEach(
        (dot, index) => {

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
    () => {

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
           CORRECT GROUP
        ========================= */

        const matchingGroup =
            groups.find(group => {

                return group.words.every(
                    word =>
                        selectedWords.includes(word)
                );

            });


        if (
            matchingGroup &&
            !solvedGroups.includes(matchingGroup)
        ) {

            solveGroup(matchingGroup);

            return;

        }


        /* =========================
           ONE AWAY
        ========================= */

        const oneAway =
            groups.find(group => {

                const matches =
                    selectedWords.filter(word =>
                        group.words.includes(word)
                    );


                return (
                    matches.length === 3 &&
                    !solvedGroups.includes(group)
                );

            });


        if (oneAway) {

            makeWrongAnimation();

            mistakes++;

            updateMistakes();

            showMessage("One away!");

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

        showMessage("Not quite!");

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


    groupCard.className =
        `solved-group ${group.className}`;


    groupCard.innerHTML = `

        <h3>${group.name}</h3>

        <p>
            ${group.words.join(" • ")}
        </p>

    `;


    solvedGroupsContainer.appendChild(
        groupCard
    );


    document
        .querySelectorAll(".word")
        .forEach(word => {

            if (
                group.words.includes(
                    word.textContent
                )
            ) {

                word.disabled = true;

                word.classList.remove(
                    "selected"
                );

                word.style.display = "none";

            }

        });


    showMessage(
        "Nice! You found a group!"
    );


    if (
        solvedGroups.length === groups.length
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
        .forEach(word => {

            word.classList.add("wrong");


            setTimeout(() => {

                word.classList.remove(
                    "wrong"
                );

            }, 350);

        });

}


/* =========================
   END GAME
========================= */

function endGame(won) {

    gameFinished = true;

    submitButton.disabled = true;

    shuffleButton.disabled = true;


    setTimeout(() => {

        gameTitle.textContent =
            won
                ? "You Won! 🎉"
                : "Game Over";


        gameDescription.textContent =
            won
                ? "You found all four groups!"
                : "Better luck tomorrow!";


        gameOverlay.classList.add("show");

    }, 500);

}


/* =========================
   PLAY AGAIN
========================= */

playAgain.addEventListener(
    "click",
    () => {

        gameOverlay.classList.remove("show");

    }
);

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

        if (event.target === helpOverlay) {

            helpOverlay.classList.remove(
                "show"
            );

        }

    }
);


/* =========================
   START
========================= */

setupGame();