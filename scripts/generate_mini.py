import os
import json
import re

from datetime import datetime
from zoneinfo import ZoneInfo

from openai import OpenAI


MAX_ATTEMPTS = 5
GRID_SIZE = 5
WORD_LENGTH = 5


client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"]
)


today = (
    datetime.now(
        ZoneInfo("America/New_York")
    )
    .date()
    .isoformat()
)


# ============================================================
# AI GENERATION
# ============================================================

def generate_puzzle():

    prompt = f"""
Create a brand-new daily crossword puzzle called
"The Grid" for {today}.

This is a very small 5x5 crossword.

IMPORTANT GRID RULES:

- Exactly 5 rows.
- Exactly 5 columns.
- Exactly 25 letters.
- NO black squares.
- Every row is a five-letter answer.
- Every column is a five-letter answer.
- All 10 answers must be different.
- Every crossing must match exactly.
- The grid must be a completely valid crossword.

NUMBERING:

Because this is a completely open 5x5 grid,
there are five Across answers and five Down answers.

Use the SAME numbers for Across and Down:

1 Across / 1 Down
2 Across / 2 Down
3 Across / 3 Down
4 Across / 4 Down
5 Across / 5 Down

There must NOT be numbers 6, 7, 8, 9, or 10.

DIFFICULTY:

- High-school level.
- Easy to medium.
- Fun and approachable.
- Similar in spirit to a short newspaper mini crossword.
- Answers should be recognizable to a typical high-school student.
- Normal everyday English.
- Familiar pop culture is allowed.
- Familiar sports, food, school, technology, movies,
  music, geography, and everyday life are allowed.
- Clever clues are encouraged when they remain fair.

ANSWER RULES:

- Every answer is exactly 5 letters.
- Letters only.
- No spaces.
- No punctuation.
- No duplicate answers.
- No nonsense words.
- No fake words.
- No obscure crossword filler.
- No archaic words.
- No extremely obscure trivia.
- No questionable spellings.
- No SATOR.
- No AREPO.
- No TENET.
- Do not use strange words simply because they
  make the grid work.

CLUE RULES:

Every answer needs one clue.

Every clue must clearly and accurately describe
its answer.

Each clue should have ONE intended answer.

Examples:

GOOD:
"Animal that says moo" -> COW
GOOD:
"Opposite of happy" -> SAD

BAD:
"Animal" -> COW
BAD:
"Something useful" -> TOOL

Avoid vague clues where several answers could fit.

Clues should be short and natural.

IMPORTANT:

Do NOT make the puzzle harder by using obscure words.

The goal is a good, fair, high-school-level daily mini.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "date": "{today}",
    "title": "The Grid",
    "grid": [
        "ABCDE",
        "FGHIJ",
        "KLMNO",
        "PQRST",
        "UVWXY"
    ],
    "clues": [
        {{
            "number": 1,
            "direction": "across",
            "clue": "Clue for row 1",
            "answer": "ABCDE"
        }},
        {{
            "number": 2,
            "direction": "across",
            "clue": "Clue for row 2",
            "answer": "FGHIJ"
        }},
        {{
            "number": 3,
            "direction": "across",
            "clue": "Clue for row 3",
            "answer": "KLMNO"
        }},
        {{
            "number": 4,
            "direction": "across",
            "clue": "Clue for row 4",
            "answer": "PQRST"
        }},
        {{
            "number": 5,
            "direction": "across",
            "clue": "Clue for row 5",
            "answer": "UVWXY"
        }},
        {{
            "number": 1,
            "direction": "down",
            "clue": "Clue for column 1",
            "answer": "AFKPU"
        }},
        {{
            "number": 2,
            "direction": "down",
            "clue": "Clue for column 2",
            "answer": "BGLQV"
        }},
        {{
            "number": 3,
            "direction": "down",
            "clue": "Clue for column 3",
            "answer": "CHMRW"
        }},
        {{
            "number": 4,
            "direction": "down",
            "clue": "Clue for column 4",
            "answer": "DINSX"
        }},
        {{
            "number": 5,
            "direction": "down",
            "clue": "Clue for column 5",
            "answer": "EJOTY"
        }}
    ]
}}

The example letters above are ONLY an example of
the required JSON structure.

Create a completely different real puzzle.
"""


    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )


    raw = response.output_text.strip()


    if raw.startswith("```"):

        raw = raw.replace(
            "```json",
            ""
        )

        raw = raw.replace(
            "```",
            ""
        )

        raw = raw.strip()


    return json.loads(raw)


# ============================================================
# MECHANICAL VALIDATION
# ============================================================

def validate_puzzle(puzzle):

    # -------------------------
    # Basic structure
    # -------------------------

    if puzzle.get("date") != today:

        raise ValueError(
            "Puzzle has incorrect date."
        )


    if puzzle.get("title") != "The Grid":

        raise ValueError(
            "Puzzle title must be The Grid."
        )


    grid = puzzle.get("grid")


    if not isinstance(grid, list):

        raise ValueError(
            "Grid must be a list."
        )


    if len(grid) != GRID_SIZE:

        raise ValueError(
            "Grid must contain exactly 5 rows."
        )


    # -------------------------
    # Validate every row
    # -------------------------

    for row in grid:

        if not isinstance(row, str):

            raise ValueError(
                "Every grid row must be text."
            )


        if not re.fullmatch(
            r"[A-Z]{5}",
            row
        ):

            raise ValueError(
                "Every grid row must contain exactly "
                "five uppercase letters."
            )


        if "#" in row:

            raise ValueError(
                "BLACK SQUARE DETECTED."
            )


    # -------------------------
    # Build columns
    # -------------------------

    columns = []

    for column in range(5):

        word = ""

        for row in range(5):

            word += grid[row][column]

        columns.append(word)


    # -------------------------
    # All 10 answers
    # -------------------------

    answers = (
        grid +
        columns
    )


    if len(answers) != 10:

        raise ValueError(
            "There must be exactly 10 answers."
        )


    if len(set(answers)) != 10:

        raise ValueError(
            "All 10 answers must be unique."
        )


    # -------------------------
    # Clues
    # -------------------------

    clues = puzzle.get("clues")


    if not isinstance(clues, list):

        raise ValueError(
            "Clues must be a list."
        )


    if len(clues) != 10:

        raise ValueError(
            "There must be exactly 10 clues."
        )


    across = [
        clue
        for clue in clues
        if clue.get("direction") == "across"
    ]


    down = [
        clue
        for clue in clues
        if clue.get("direction") == "down"
    ]


    if len(across) != 5:

        raise ValueError(
            "There must be exactly 5 Across clues."
        )


    if len(down) != 5:

        raise ValueError(
            "There must be exactly 5 Down clues."
        )


    # -------------------------
    # Shared numbering
    # -------------------------

    across_numbers = sorted(
        clue.get("number")
        for clue in across
    )


    down_numbers = sorted(
        clue.get("number")
        for clue in down
    )


    if across_numbers != [1, 2, 3, 4, 5]:

        raise ValueError(
            "Across numbers must be 1 through 5."
        )


    if down_numbers != [1, 2, 3, 4, 5]:

        raise ValueError(
            "Down numbers must be 1 through 5."
        )


    # -------------------------
    # Answers must match grid
    # -------------------------

    across.sort(
        key=lambda clue: clue["number"]
    )


    down.sort(
        key=lambda clue: clue["number"]
    )


    for index, clue in enumerate(across):

        expected = grid[index]


        if clue.get("answer") != expected:

            raise ValueError(
                f"Across #{clue['number']} "
                f"does not match the grid."
            )


    for index, clue in enumerate(down):

        expected = columns[index]


        if clue.get("answer") != expected:

            raise ValueError(
                f"Down #{clue['number']} "
                f"does not match the grid."
            )


    # -------------------------
    # Unique answers
    # -------------------------

    clue_answers = [
        clue.get("answer")
        for clue in clues
    ]


    if len(set(clue_answers)) != 10:

        raise ValueError(
            "Clue answers must all be unique."
        )


    # -------------------------
    # Unique clues
    # -------------------------

    clue_texts = []


    for clue in clues:

        text = str(
            clue.get("clue", "")
        ).strip().lower()


        if not text:

            raise ValueError(
                "A clue is empty."
            )


        clue_texts.append(text)


    if len(set(clue_texts)) != 10:

        raise ValueError(
            "Duplicate clues detected."
        )


    # -------------------------
    # Forbidden words
    # -------------------------

    forbidden = {
        "SATOR",
        "AREPO",
        "TENET"
    }


    for answer in answers:

        if answer in forbidden:

            raise ValueError(
                f"Forbidden word detected: {answer}"
            )


    return True


# ============================================================
# AI QUALITY CHECK
# ============================================================

def quality_check(puzzle):

    prompt = f"""
You are the final editor for "The Grid",
a daily 5x5 crossword.

Review the ENTIRE puzzle below.

The puzzle must satisfy ALL of these requirements:

GRID:

- Exactly 5 rows.
- Exactly 5 columns.
- No black squares.
- Exactly 25 letters.
- Every row is a real five-letter English answer.
- Every column is a real five-letter English answer.
- All 10 answers are different.
- Every crossing is correct.

NUMBERING:

- Five Across clues numbered 1 through 5.
- Five Down clues numbered 1 through 5.
- Across and Down share the same numbers.
- There are NO clue numbers 6 through 10.

DIFFICULTY:

- High-school level.
- Easy to medium.
- Fair and approachable.
- Similar in spirit to a short newspaper mini crossword.

ANSWER QUALITY:

Reject the puzzle if it contains:

- SATOR
- AREPO
- TENET
- obscure ancient words
- archaic words
- nonsense
- fake words
- questionable spellings
- obscure crossword filler
- words that are only being used because
  they happen to fit the grid

CLUE QUALITY:

Review EVERY clue individually.

For every clue:

1. The clue must accurately describe its answer.
2. The answer must actually be correct.
3. The clue must be fair.
4. The clue must be specific.
5. The clue should have one intended answer.
6. The answer should be recognizable to a
   typical high-school student.
7. There must be no factual error.
8. There must be no misleading clue.
9. There must be no duplicate clue.
10. The clue should sound natural.

Reject the ENTIRE puzzle if even one clue
is substantially wrong.

Do not approve a puzzle simply because
the grid technically works.

Return ONLY valid JSON.

If the puzzle is good:

{{
    "approved": true,
    "reason": "The puzzle is valid, fair, and appropriate."
}}

If anything is wrong:

{{
    "approved": false,
    "reason": "Explain exactly what is wrong."
}}

PUZZLE:

{json.dumps(
    puzzle,
    indent=4
)}
"""


    response = client.responses.create(
        model="gpt-5.6-luna",
        input=prompt
    )


    raw = response.output_text.strip()


    if raw.startswith("```"):

        raw = raw.replace(
            "```json",
            ""
        )

        raw = raw.replace(
            "```",
            ""
        )

        raw = raw.strip()


    result = json.loads(raw)


    if result.get("approved") is not True:

        raise ValueError(
            "AI quality check failed: "
            + result.get(
                "reason",
                "Unknown reason."
            )
        )


# ============================================================
# GENERATION LOOP
# ============================================================

print()
print("====================================")
print("        GENERATING THE GRID")
print("====================================")


successful_puzzle = None


for attempt in range(
    1,
    MAX_ATTEMPTS + 1
):

    print()
    print(
        f"ATTEMPT {attempt}/{MAX_ATTEMPTS}"
    )


    try:

        puzzle = generate_puzzle()


        print(
            "AI generated a puzzle."
        )


        validate_puzzle(
            puzzle
        )


        print(
            "Mechanical validation passed."
        )


        quality_check(
            puzzle
        )


        print(
            "AI quality check passed."
        )


        successful_puzzle = puzzle


        print()
        print(
            "✅ THE GRID PASSED ALL CHECKS!"
        )


        break


    except Exception as error:

        print()
        print(
            "❌ PUZZLE REJECTED!"
        )


        print(
            f"Reason: {error}"
        )


        if attempt < MAX_ATTEMPTS:

            print(
                "🔄 Generating another Grid..."
            )


# ============================================================
# SAVE ONLY APPROVED PUZZLE
# ============================================================

if successful_puzzle is None:

    print()
    print(
        "❌ ALL 5 ATTEMPTS FAILED."
    )

    raise SystemExit(1)


os.makedirs(
    "puzzles",
    exist_ok=True
)


with open(
    "puzzles/mini.json",
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        successful_puzzle,
        file,
        indent=4
    )


# ============================================================
# PRINT FINAL PUZZLE
# ============================================================

print()
print("====================================")
print("        🎉 THE GRID IS READY!")
print("====================================")

print()

for row in successful_puzzle["grid"]:

    print(row)


print()

print("CLUES:")

print()

for clue in successful_puzzle["clues"]:

    print(
        f"#{clue['number']} "
        f"{clue['direction'].upper()}: "
        f"{clue['clue']} "
        f"({clue['answer']})"
    )


print()
print("====================================")
print("✅ 5x5 grid")
print("✅ 25 letters")
print("✅ ZERO black squares")
print("✅ 5 Across + 5 Down")
print("✅ Shared 1-5 numbering")
print("✅ Unique answers")
print("✅ Unique clues")
print("✅ Crossings verified")
print("✅ High-school difficulty requested")
print("✅ AI clue review passed")
print("====================================")

print()
print(
    "Saved to puzzles/mini.json"
)