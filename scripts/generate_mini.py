import os
import json
import re

from datetime import datetime
from zoneinfo import ZoneInfo

from openai import OpenAI


MAX_ATTEMPTS = 8
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

This is a 5x5 crossword with NO black squares.

IMPORTANT:

The grid must contain exactly 5 rows of 5 letters.

Every ROW must be a normal five-letter English word.

Every COLUMN must ALSO be a normal five-letter English word.

This means the grid is a 5x5 word square-style crossword.

Do NOT invent words.

Do NOT use obscure crossword filler.

Do NOT use archaic words.

Do NOT use nonsense.

Do NOT use SATOR, AREPO, or TENET.

All 10 resulting words must be different.

The puzzle should be:

- High-school level
- Easy to medium
- Fun
- Fair
- Familiar
- Similar in spirit to a newspaper mini crossword

Normal topics are encouraged:

- school
- food
- sports
- technology
- movies
- music
- geography
- animals
- everyday life
- familiar pop culture

Clever clues are okay, but they must remain fair.

VERY IMPORTANT:

You MUST calculate the columns from the grid yourself.

Do NOT invent separate Down answers that do not exactly match
the letters in the grid.

NUMBERING:

There are exactly:

1 Across
2 Across
3 Across
4 Across
5 Across

and:

1 Down
2 Down
3 Down
4 Down
5 Down

Across and Down share the same numbers.

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
    "across_clues": [
        {{
            "number": 1,
            "clue": "Clue for row 1"
        }},
        {{
            "number": 2,
            "clue": "Clue for row 2"
        }},
        {{
            "number": 3,
            "clue": "Clue for row 3"
        }},
        {{
            "number": 4,
            "clue": "Clue for row 4"
        }},
        {{
            "number": 5,
            "clue": "Clue for row 5"
        }}
    ],
    "down_clues": [
        {{
            "number": 1,
            "clue": "Clue for column 1"
        }},
        {{
            "number": 2,
            "clue": "Clue for column 2"
        }},
        {{
            "number": 3,
            "clue": "Clue for column 3"
        }},
        {{
            "number": 4,
            "clue": "Clue for column 4"
        }},
        {{
            "number": 5,
            "clue": "Clue for column 5"
        }}
    ]
}}

The example letters above are ONLY an example of the structure.

Create a completely different real puzzle.

DO NOT include answers in the clue objects.

The program will calculate the answers directly from the grid.
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
# BUILD FINAL CLUES
# ============================================================

def build_final_puzzle(candidate):

    grid = candidate["grid"]


    columns = []

    for column in range(GRID_SIZE):

        word = ""

        for row in range(GRID_SIZE):

            word += grid[row][column]

        columns.append(word)


    clues = []


    across_clues = candidate.get(
        "across_clues",
        []
    )


    down_clues = candidate.get(
        "down_clues",
        []
    )


    across_by_number = {
        clue["number"]: clue["clue"]
        for clue in across_clues
    }


    down_by_number = {
        clue["number"]: clue["clue"]
        for clue in down_clues
    }


    for number in range(1, 6):

        clues.append(
            {
                "number": number,
                "direction": "across",
                "clue": across_by_number[number],
                "answer": grid[number - 1]
            }
        )


    for number in range(1, 6):

        clues.append(
            {
                "number": number,
                "direction": "down",
                "clue": down_by_number[number],
                "answer": columns[number - 1]
            }
        )


    return {
        "date": candidate["date"],
        "title": "The Grid",
        "grid": grid,
        "clues": clues
    }


# ============================================================
# MECHANICAL VALIDATION
# ============================================================

def validate_puzzle(puzzle):

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


    # ========================================================
    # BUILD COLUMNS OURSELVES
    # ========================================================

    columns = []

    for column in range(GRID_SIZE):

        word = ""

        for row in range(GRID_SIZE):

            word += grid[row][column]

        columns.append(word)


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


    # ========================================================
    # CLUES
    # ========================================================

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


    # ========================================================
    # ANSWERS MUST MATCH GRID
    # ========================================================

    across.sort(
        key=lambda clue: clue["number"]
    )


    down.sort(
        key=lambda clue: clue["number"]
    )


    for index, clue in enumerate(across):

        if clue.get("answer") != grid[index]:

            raise ValueError(
                f"Across #{clue['number']} "
                f"does not match the grid."
            )


    for index, clue in enumerate(down):

        if clue.get("answer") != columns[index]:

            raise ValueError(
                f"Down #{clue['number']} "
                f"does not match the grid."
            )


    # ========================================================
    # UNIQUE CLUES
    # ========================================================

    clue_texts = []


    for clue in clues:

        clue_text = str(
            clue.get("clue", "")
        ).strip().lower()


        if not clue_text:

            raise ValueError(
                "A clue is empty."
            )


        clue_texts.append(
            clue_text
        )


    if len(set(clue_texts)) != 10:

        raise ValueError(
            "Duplicate clues detected."
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

The puzzle must satisfy ALL of these requirements.

GRID:

- Exactly 5 rows.
- Exactly 5 columns.
- Exactly 25 letters.
- No black squares.
- Every row is a real five-letter English word.
- Every column is a real five-letter English word.
- All 10 answers are different.
- Every crossing is correct.

DIFFICULTY:

- High-school level.
- Easy to medium.
- Fair.
- Approachable.
- Similar in spirit to a short newspaper mini crossword.

ANSWER QUALITY:

Reject the puzzle if ANY answer is:

- nonsense
- fake
- archaic
- extremely obscure
- questionable spelling
- obscure crossword filler
- SATOR
- AREPO
- TENET

The answers should be recognizable to a typical
English-speaking high-school student.

CLUE QUALITY:

Check EVERY clue.

Each clue must:

1. Accurately describe its answer.
2. Have the correct intended answer.
3. Be fair.
4. Be specific.
5. Be natural.
6. Avoid major ambiguity.
7. Avoid factual errors.
8. Avoid duplicate clues.

If even ONE clue is substantially wrong,
reject the entire puzzle.

IMPORTANT:

The puzzle is NOT allowed to be approved merely because
the letters technically form words.

The answers and clues must make a good daily puzzle.

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

        candidate = generate_puzzle()


        print(
            "AI generated a candidate."
        )


        puzzle = build_final_puzzle(
            candidate
        )


        print(
            "Calculated Down answers from grid."
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
        "❌ ALL ATTEMPTS FAILED."
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
print("✅ Down answers calculated automatically")
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