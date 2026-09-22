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

The puzzle should feel like a polished newspaper
mini crossword that a typical high school student
could solve in a few minutes.

DIFFICULTY:

- Easy to medium difficulty.
- Appropriate for high school students.
- Use common English words.
- Use everyday knowledge.
- Use familiar pop culture, school, sports,
  technology, food, movies, music, and wordplay
  when appropriate.
- Do NOT use extremely obscure vocabulary.
- Do NOT require specialized academic knowledge.
- Avoid clues that depend on very old historical
  facts that most high school students would not know.
- Make some clues clever or playful, but keep them
  solvable.

GRID:

- Choose a grid size between 5x5 and 8x8.
- The grid does NOT have to be square-shaped.
- Width and height may be different.
- Use "#" for black squares.
- Every other square must contain exactly one
  uppercase letter.
- Black squares should create a real crossword layout.
- Do not make the grid completely open every time.
- Vary the black-square pattern from day to day.
- Avoid extremely large empty areas.
- Avoid isolated single-letter entries.
- Every Across and Down answer should normally be
  at least 2 letters long.
- Prefer crossword entries of 3 or more letters.

CROSSWORD RULES:

- Every Across answer must exactly match the letters
  in the grid.
- Every Down answer must exactly match the letters
  in the grid.
- Every answer must be a real English word, name,
  abbreviation, or commonly accepted crossword entry.
- Do not invent words.
- Answers must contain letters only.
- Do not use duplicate answers unless absolutely
  necessary.
- Do not use duplicate clues.
- Every clue must have exactly one intended answer.
- All numbered clues must use standard crossword
  numbering.
- A square receives a number if it begins an Across
  or Down answer.
- Do not create one-letter Across or Down answers.

VARIETY:

Try to include a mixture of:

- straightforward clues
- clever clues
- wordplay
- everyday references
- familiar names
- abbreviations
- short common words

Do not make every clue the same type.

IMPORTANT:

The grid and clues MUST agree perfectly.

Before returning the puzzle, mentally verify:

1. Every Across answer matches the grid.
2. Every Down answer matches the grid.
3. Every clue number is correct.
4. Every answer is spelled correctly.
5. There are no one-letter answers.
6. Every non-black square contains a letter.
7. The grid is rectangular.
8. The puzzle is solvable using the clues.

Return ONLY valid JSON.

The JSON MUST have exactly this structure:

{{
    "date": "{today}",

    "grid": [
        "....#...",
        "...##...",
        "........",
        "..#.....",
        "...#...."
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

- Grid rows may contain different lengths only if
  the entire grid is intentionally rectangular.
- All rows MUST have the same length.
- Grid height may be between 5 and 8 rows.
- Grid width may be between 5 and 8 columns.
- "#" represents a black square.
- Every other character must be an uppercase letter.
- Do NOT return "." in the final grid.
- Across answers must exactly match their grid positions.
- Down answers must exactly match their grid positions.
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


height = len(grid)


if height < 5 or height > 8:
    raise ValueError(
        "Grid height must be between 5 and 8."
    )


width = len(grid[0])


if width < 5 or width > 8:
    raise ValueError(
        "Grid width must be between 5 and 8."
    )


for row in grid:

    if len(row) != width:
        raise ValueError(
            "All grid rows must have the same width."
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
# FIND WORDS IN GRID
# =========================

def get_across_words():

    words = []

    for row in range(height):

        col = 0

        while col < width:

            if grid[row][col] == "#":

                col += 1
                continue


            start_col = col


            while (
                col < width and
                grid[row][col] != "#"
            ):

                col += 1


            length = col - start_col


            if length >= 2:

                words.append(
                    (
                        row,
                        start_col,
                        row,
                        col - 1
                    )
                )


    return words


def get_down_words():

    words = []

    for col in range(width):

        row = 0

        while row < height:

            if grid[row][col] == "#":

                row += 1
                continue


            start_row = row


            while (
                row < height and
                grid[row][col] != "#"
            ):

                row += 1


            length = row - start_row


            if length >= 2:

                words.append(
                    (
                        start_row,
                        col,
                        row - 1,
                        col
                    )
                )


    return words


across_positions = get_across_words()
down_positions = get_down_words()


# =========================
# REJECT ONE-LETTER WORDS
# =========================

for row in range(height):

    for col in range(width):

        if grid[row][col] == "#":
            continue


        across_length = 1

        left = col - 1

        while (
            left >= 0 and
            grid[row][left] != "#"
        ):

            across_length += 1
            left -= 1


        right = col + 1

        while (
            right < width and
            grid[row][right] != "#"
        ):

            across_length += 1
            right += 1


        down_length = 1

        up = row - 1

        while (
            up >= 0 and
            grid[up][col] != "#"
        ):

            down_length += 1
            up -= 1


        down = row + 1

        while (
            down < height and
            grid[down][col] != "#"
        ):

            down_length += 1
            down += 1


        if (
            across_length == 1 or
            down_length == 1
        ):

            raise ValueError(
                "Grid contains a one-letter word."
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
# ANSWER / GRID VALIDATION
# =========================

def across_answer(row, start_col):

    letters = []

    col = start_col

    while (
        col < width and
        grid[row][col] != "#"
    ):

        letters.append(
            grid[row][col]
        )

        col += 1


    return "".join(letters)


def down_answer(start_row, col):

    letters = []

    row = start_row

    while (
        row < height and
        grid[row][col] != "#"
    ):

        letters.append(
            grid[row][col]
        )

        row += 1


    return "".join(letters)


for clue in puzzle["across"]:

    number = clue["number"]
    answer = clue["answer"].upper()

    matching_positions = []


    for row in range(height):

        for col in range(width):

            if grid[row][col] == "#":
                continue


            if (
                (
                    col == 0 or
                    grid[row][col - 1] == "#"
                )
                and
                col + 1 < width
                and
                grid[row][col + 1] != "#"
            ):

                calculated = across_answer(
                    row,
                    col
                )


                if calculated == answer:

                    matching_positions.append(
                        (row, col)
                    )


    if not matching_positions:

        raise ValueError(
            f"Across answer does not match grid: {answer}"
        )


for clue in puzzle["down"]:

    answer = clue["answer"].upper()

    matching_positions = []


    for row in range(height):

        for col in range(width):

            if grid[row][col] == "#":
                continue


            if (
                (
                    row == 0 or
                    grid[row - 1][col] == "#"
                )
                and
                row + 1 < height
                and
                grid[row + 1][col] != "#"
            ):

                calculated = down_answer(
                    row,
                    col
                )


                if calculated == answer:

                    matching_positions.append(
                        (row, col)
                    )


    if not matching_positions:

        raise ValueError(
            f"Down answer does not match grid: {answer}"
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

print(
    f"Grid size: {height}x{width}"
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