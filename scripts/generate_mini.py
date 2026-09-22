import os
import json

from datetime import datetime
from zoneinfo import ZoneInfo

from openai import OpenAI


client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"]
)


# Get today's date in Eastern Time
today = (
    datetime.now(
        ZoneInfo("America/New_York")
    )
    .date()
    .isoformat()
)


prompt = f"""
Create a brand-new Mini Crossword puzzle
for {today}.

The puzzle should be a small, fun crossword
that can be completed in a few minutes.

REQUIREMENTS:

- Use a 5x5 grid.
- Use "#" for black squares.
- Use uppercase letters for filled squares.
- Every non-black square must contain exactly one letter.
- The crossword must have valid Across and Down words.
- Every word must be a real English word.
- Use recognizable words appropriate for a typical
  English-speaking player.
- Avoid extremely obscure words.
- Avoid offensive or inappropriate words.
- Make the clues fun and reasonably challenging.
- Every answer must exactly match its corresponding
  grid letters.
- Do not use duplicate clues.
- Do not use duplicate answers unless absolutely
  necessary.
- The puzzle must be solvable from the provided clues.

Return ONLY valid JSON.

The JSON MUST have exactly this structure:

{{
    "date": "{today}",

    "grid": [
        ".....",
        ".....",
        "..#..",
        ".....",
        "....."
    ],

    "across": [
        {{
            "number": 1,
            "clue": "CLUE",
            "answer": "WORD"
        }}
    ],

    "down": [
        {{
            "number": 1,
            "clue": "CLUE",
            "answer": "WORD"
        }}
    ]
}}

IMPORTANT:

- The grid MUST contain exactly 5 rows.
- Every row MUST contain exactly 5 characters.
- "#" represents a black square.
- Every other character must be an uppercase letter.
- Across answers must exactly match the corresponding
  horizontal letters in the grid.
- Down answers must exactly match the corresponding
  vertical letters in the grid.
- The clue numbers must correspond to standard crossword
  numbering.
"""


response = client.responses.create(
    model="gpt-5.6-luna",
    input=prompt
)


raw_text = response.output_text.strip()


if raw_text.startswith("```"):

    raw_text = raw_text.replace(
        "```json",
        ""
    )

    raw_text = raw_text.replace(
        "```",
        ""
    )

    raw_text = raw_text.strip()


puzzle = json.loads(raw_text)


# =========================
# BASIC VALIDATION
# =========================

if "date" not in puzzle:

    raise ValueError(
        "Puzzle is missing date."
    )


if "grid" not in puzzle:

    raise ValueError(
        "Puzzle is missing grid."
    )


if "across" not in puzzle:

    raise ValueError(
        "Puzzle is missing across clues."
    )


if "down" not in puzzle:

    raise ValueError(
        "Puzzle is missing down clues."
    )


# =========================
# GRID VALIDATION
# =========================

grid = puzzle["grid"]


if len(grid) != 5:

    raise ValueError(
        "Grid must contain exactly 5 rows."
    )


for row in grid:

    if len(row) != 5:

        raise ValueError(
            "Every grid row must contain exactly 5 characters."
        )


    for character in row:

        if (
            character != "#" and
            not (
                character.isalpha() and
                character.isupper()
            )
        ):

            raise ValueError(
                "Grid may only contain uppercase letters and #."
            )


# =========================
# CLUE VALIDATION
# =========================

for clue in puzzle["across"]:

    if "number" not in clue:

        raise ValueError(
            "Across clue is missing number."
        )


    if "clue" not in clue:

        raise ValueError(
            "Across clue is missing clue text."
        )


    if "answer" not in clue:

        raise ValueError(
            "Across clue is missing answer."
        )


    if not clue["answer"].isalpha():

        raise ValueError(
            "Across answers must contain letters only."
        )


for clue in puzzle["down"]:

    if "number" not in clue:

        raise ValueError(
            "Down clue is missing number."
        )


    if "clue" not in clue:

        raise ValueError(
            "Down clue is missing clue text."
        )


    if "answer" not in clue:

        raise ValueError(
            "Down clue is missing answer."
        )


    if not clue["answer"].isalpha():

        raise ValueError(
            "Down answers must contain letters only."
        )


# =========================
# SAVE PUZZLE
# =========================

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
        puzzle,
        file,
        indent=4
    )


print("====================================")
print("NEW MINI CROSSWORD GENERATED!")
print("====================================")

print(
    f"Date: {puzzle['date']}"
)

print()

print("Grid:")

for row in grid:

    print(row)

print()

print(
    f"Across clues: {len(puzzle['across'])}"
)

print(
    f"Down clues: {len(puzzle['down'])}"
)

print()

print(
    "Saved to puzzles/mini.json"
)