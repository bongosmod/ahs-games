import os
import json

from datetime import datetime
from zoneinfo import ZoneInfo

from openai import OpenAI


client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"]
)


# =========================
# SETTINGS
# =========================

MAX_ATTEMPTS = 5


# =========================
# DATE
# =========================

today = (
    datetime.now(
        ZoneInfo("America/New_York")
    )
    .date()
    .isoformat()
)


# =========================
# GENERATE PUZZLE
# =========================

def generate_puzzle():

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
- Make some clues clever or playful, but keep them
  clearly solvable.

GRID:

- Choose a grid size between 5x5 and 8x8.
- The grid may be square OR rectangular.
- Width and height may be different.
- Black squares are OPTIONAL.
- You MAY use "#" for black squares.
- You do NOT have to use black squares.
- If black squares are used, make the pattern feel
  like a real crossword.
- Avoid isolated sections.
- Avoid one-letter entries.
- Every non-black square must contain exactly one
  uppercase letter.

CROSSWORD NUMBERING:

A crossword starting square has ONE number.

If an Across answer and a Down answer begin at the
same square, they MUST have the SAME number.

For example:

7 Across and 7 Down are correct if both begin at
the exact same square.

Do NOT assign different numbers to the same square.

Use standard crossword numbering:

- Number squares from top-left to bottom-right.
- A square receives a number if it begins an Across
  answer, a Down answer, or both.
- Numbering starts at 1.
- Across and Down share numbers when appropriate.

CLUE QUALITY:

This is extremely important.

Every clue MUST accurately describe its answer.

Before returning the puzzle, mentally test every
clue-answer pair.

Examples:

GOOD:
"Animal that says moo" → COW

GOOD:
"Opposite of yes" → NO

BAD:
"Animal that says moo" → HORSE

BAD:
"Opposite of hot" → SUN

Do NOT create clues that merely sound plausible.

Do NOT make a clue whose answer could reasonably
be several different words unless the clue clearly
specifies the intended answer.

Avoid vague clues.

Avoid incorrect definitions.

Avoid factual errors.

Avoid clues that require obscure knowledge.

For names, movies, songs, brands, sports, etc.,
make sure the clue actually refers to the answer.

For abbreviations, make sure the clue clearly
indicates that an abbreviation is expected.

For wordplay, make sure the intended answer is
clear and fair.

Every clue should have ONE intended answer.

CROSSWORD RULES:

- Every Across answer must exactly match the letters
  in the grid.
- Every Down answer must exactly match the letters
  in the grid.
- Every actual Across entry must have exactly one
  Across clue.
- Every actual Down entry must have exactly one
  Down clue.
- Every clue number must match its exact starting
  square.
- Every answer must be spelled correctly.
- Answers must contain letters only.
- Do not invent words.
- Do not create one-letter entries.
- Do not use duplicate clues.
- Avoid duplicate answers.
- Every answer must be appropriate for the clue.

BLACK SQUARES:

Black squares are OPTIONAL.

A completely open grid is allowed.

If you use black squares:

- Use "#" exactly.
- Keep the grid rectangular.
- Do not create one-letter entries.
- Make the pattern useful for the crossword.
- Make sure every resulting Across and Down answer
  is valid.

VARIETY:

Use a mixture of:

- straightforward clues
- clever clues
- wordplay
- everyday references
- familiar names
- abbreviations
- short common words

Do not make every clue the same type.

FINAL QUALITY CHECK:

Before returning the JSON, verify ALL of these:

1. Every Across answer matches the grid.
2. Every Down answer matches the grid.
3. Every clue accurately describes its answer.
4. Every clue has one intended answer.
5. No clue contains a factual error.
6. No answer is invented.
7. Every clue number matches its starting square.
8. Across and Down share a number when starting
   at the same square.
9. Every actual Across entry has a clue.
10. Every actual Down entry has a clue.
11. There are no one-letter entries.
12. Every non-black square contains a letter.
13. All grid rows have the same length.
14. The grid is between 5x5 and 8x8.
15. The puzzle is solvable using the clues.

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

- Do NOT return "." in the final grid.
- "#" means a black square.
- Every other character must be an uppercase letter.
- All rows must have the same length.
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


    return json.loads(raw_text)


# =========================
# AI QUALITY CHECK
# =========================

def quality_check(
    puzzle
):

    quality_prompt = f"""
You are the final quality-control editor
for a daily Mini Crossword.

Review this crossword extremely carefully.

Your job is NOT to rewrite it.

Determine whether the puzzle is acceptable.

Check EVERY clue and answer.

For every clue:

1. Does the clue actually describe the answer?
2. Is the answer factually correct?
3. Is the clue fair?
4. Is there one clear intended answer?
5. Is the answer spelled correctly?
6. Is the clue appropriate for a high school student?
7. Is the clue too obscure or misleading?
8. If it uses wordplay, is the wordplay fair?
9. If it uses a name, movie, song, brand, sport,
   abbreviation, etc., does the clue correctly
   refer to that thing?

Also check:

- The grid and answers.
- Crossword numbering.
- Shared Across/Down numbers.
- Duplicate answers.
- Duplicate clues.
- Overall solvability.

A technically matching answer is NOT enough.

For example:

Clue: "Animal that says moo"
Answer: "HORSE"

This MUST be rejected.

Clue: "Animal that says moo"
Answer: "COW"

This is acceptable.

Return ONLY valid JSON.

Use exactly:

{{
    "approved": true,
    "reason": "Short explanation"
}}

or:

{{
    "approved": false,
    "reason": "Short explanation"
}}

Here is the crossword:

{json.dumps(puzzle, indent=4)}
"""


    response = client.responses.create(
        model="gpt-5.6-luna",
        input=quality_prompt
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


    result = json.loads(
        raw_text
    )


    if "approved" not in result:
        raise ValueError(
            "AI quality check did not return approval."
        )


    if not result["approved"]:

        reason = result.get(
            "reason",
            "AI quality check rejected puzzle."
        )


        raise ValueError(
            f"AI quality check failed: {reason}"
        )


    return result


# =========================
# GRID HELPERS
# =========================

def starts_across(
    grid,
    row,
    col
):

    width = len(grid[0])


    if grid[row][col] == "#":
        return False


    if (
        col == 0
        or grid[row][col - 1] == "#"
    ):

        return (
            col + 1 < width
            and grid[row][col + 1] != "#"
        )


    return False


def starts_down(
    grid,
    row,
    col
):

    height = len(grid)


    if grid[row][col] == "#":
        return False


    if (
        row == 0
        or grid[row - 1][col] == "#"
    ):

        return (
            row + 1 < height
            and grid[row + 1][col] != "#"
        )


    return False


# =========================
# VALIDATE PUZZLE
# =========================

def validate_puzzle(
    puzzle
):

    # =========================
    # BASIC FIELDS
    # =========================

    if "date" not in puzzle:
        raise ValueError(
            "Puzzle is missing date."
        )


    if puzzle["date"] != today:
        raise ValueError(
            "Puzzle date does not match today's date."
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


    grid = puzzle["grid"]


    # =========================
    # GRID SIZE
    # =========================

    height = len(grid)


    if height < 5 or height > 8:
        raise ValueError(
            "Grid height must be between 5 and 8."
        )


    if not grid:
        raise ValueError(
            "Grid is empty."
        )


    width = len(grid[0])


    if width < 5 or width > 8:
        raise ValueError(
            "Grid width must be between 5 and 8."
        )


    # =========================
    # GRID CHARACTERS
    # =========================

    for row in grid:

        if len(row) != width:
            raise ValueError(
                "All grid rows must have the same width."
            )


        for character in row:

            if (
                character != "#"
                and not (
                    character.isalpha()
                    and character.isupper()
                )
            ):

                raise ValueError(
                    "Grid may only contain uppercase "
                    "letters and #."
                )


    # =========================
    # NUMBERING
    # =========================

    number_map = {}

    current_number = 0


    for row in range(height):

        for col in range(width):

            if grid[row][col] == "#":
                continue


            if (
                starts_across(
                    grid,
                    row,
                    col
                )
                or
                starts_down(
                    grid,
                    row,
                    col
                )
            ):

                current_number += 1

                number_map[
                    (row, col)
                ] = current_number


    # =========================
    # EXTRACT GRID ANSWERS
    # =========================

    def across_answer(
        row,
        col
    ):

        letters = []


        while (
            col < width
            and grid[row][col] != "#"
        ):

            letters.append(
                grid[row][col]
            )

            col += 1


        return "".join(
            letters
        )


    def down_answer(
        row,
        col
    ):

        letters = []


        while (
            row < height
            and grid[row][col] != "#"
        ):

            letters.append(
                grid[row][col]
            )

            row += 1


        return "".join(
            letters
        )


    actual_across = {}
    actual_down = {}


    for row in range(height):

        for col in range(width):

            if starts_across(
                grid,
                row,
                col
            ):

                number = number_map[
                    (row, col)
                ]


                answer = across_answer(
                    row,
                    col
                )


                if len(answer) < 2:
                    raise ValueError(
                        "Grid contains a one-letter "
                        "Across entry."
                    )


                actual_across[
                    number
                ] = {
                    "row": row,
                    "col": col,
                    "answer": answer
                }


            if starts_down(
                grid,
                row,
                col
            ):

                number = number_map[
                    (row, col)
                ]


                answer = down_answer(
                    row,
                    col
                )


                if len(answer) < 2:
                    raise ValueError(
                        "Grid contains a one-letter "
                        "Down entry."
                    )


                actual_down[
                    number
                ] = {
                    "row": row,
                    "col": col,
                    "answer": answer
                }


    # =========================
    # CLUE VALIDATION
    # =========================

    def validate_clues(
        clues,
        actual_entries,
        direction
    ):

        seen_numbers = set()


        for clue in clues:

            if "number" not in clue:
                raise ValueError(
                    f"{direction} clue is missing number."
                )


            if "clue" not in clue:
                raise ValueError(
                    f"{direction} clue is missing clue text."
                )


            if "answer" not in clue:
                raise ValueError(
                    f"{direction} clue is missing answer."
                )


            number = clue["number"]

            answer = clue["answer"].upper()


            if not isinstance(
                number,
                int
            ):

                raise ValueError(
                    f"{direction} clue number must "
                    f"be an integer."
                )


            if number in seen_numbers:

                raise ValueError(
                    f"Duplicate {direction} "
                    f"clue number: {number}"
                )


            seen_numbers.add(
                number
            )


            if not answer.isalpha():

                raise ValueError(
                    f"{direction} answer must contain "
                    f"letters only: {answer}"
                )


            if number not in actual_entries:

                raise ValueError(
                    f"{direction} clue #{number} "
                    f"does not start an actual "
                    f"grid entry."
                )


            expected_answer = actual_entries[
                number
            ]["answer"]


            if answer != expected_answer:

                raise ValueError(
                    f"{direction} clue #{number} "
                    f"is wrong. Grid says "
                    f"'{expected_answer}' but AI "
                    f"gave '{answer}'."
                )


        actual_numbers = set(
            actual_entries.keys()
        )


        clue_numbers = set(
            seen_numbers
        )


        if actual_numbers != clue_numbers:

            missing = (
                actual_numbers
                - clue_numbers
            )

            extra = (
                clue_numbers
                - actual_numbers
            )


            raise ValueError(
                f"{direction} clue list does not "
                f"exactly match the grid. "
                f"Missing: {sorted(missing)} "
                f"Extra: {sorted(extra)}"
            )


    # Validate Across
    validate_clues(
        puzzle["across"],
        actual_across,
        "Across"
    )


    # Validate Down
    validate_clues(
        puzzle["down"],
        actual_down,
        "Down"
    )


    # =========================
    # SHARED NUMBER VALIDATION
    # =========================

    all_numbers = (
        set(actual_across.keys())
        |
        set(actual_down.keys())
    )


    for number in all_numbers:

        across_entry = (
            actual_across.get(number)
        )

        down_entry = (
            actual_down.get(number)
        )


        if (
            across_entry is not None
            and down_entry is not None
        ):

            if (
                across_entry["row"],
                across_entry["col"]
            ) != (
                down_entry["row"],
                down_entry["col"]
            ):

                raise ValueError(
                    f"Number #{number} is assigned "
                    f"to different starting squares."
                )


    # =========================
    # NUMBER SEQUENCE
    # =========================

    expected_numbers = set(
        range(
            1,
            current_number + 1
        )
    )


    if set(
        number_map.values()
    ) != expected_numbers:

        raise ValueError(
            "Crossword numbering is not sequential."
        )


    # =========================
    # RETURN VALIDATED DATA
    # =========================

    return {
        "puzzle": puzzle,
        "height": height,
        "width": width,
        "number_count": current_number
    }


# =========================
# GENERATION LOOP
# =========================

validated = None


for attempt in range(
    1,
    MAX_ATTEMPTS + 1
):

    print()
    print(
        "===================================="
    )

    print(
        f"GENERATING MINI PUZZLE "
        f"(ATTEMPT {attempt}/{MAX_ATTEMPTS})"
    )

    print(
        "===================================="
    )


    try:

        # -------------------------
        # Generate
        # -------------------------

        puzzle = generate_puzzle()


        print(
            "AI generated puzzle."
        )


        # -------------------------
        # AI quality check
        # -------------------------

        print(
            "Running AI clue quality check..."
        )


        quality_check(
            puzzle
        )


        print(
            "AI quality check passed."
        )


        # -------------------------
        # Mechanical validation
        # -------------------------

        print(
            "Running technical validation..."
        )


        validated = validate_puzzle(
            puzzle
        )


        print(
            "Technical validation passed."
        )


        print()
        print(
            "✅ PUZZLE APPROVED!"
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


        if attempt == MAX_ATTEMPTS:

            print()
            print(
                "❌ ALL GENERATION ATTEMPTS FAILED."
            )

            raise


        print()
        print(
            "🔄 Generating a completely new puzzle..."
        )


# =========================
# SAVE
# =========================

puzzle = validated["puzzle"]

height = validated["height"]

width = validated["width"]

number_count = validated[
    "number_count"
]


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


# =========================
# FINAL OUTPUT
# =========================

print()
print(
    "===================================="
)

print(
    "🎉 NEW MINI CROSSWORD GENERATED!"
)

print(
    "===================================="
)

print(
    f"Date: {puzzle['date']}"
)

print()

print(
    f"Grid size: {height}x{width}"
)

print()

print("Grid:")

for row in puzzle["grid"]:

    print(row)

print()

print(
    f"Across clues: {len(puzzle['across'])}"
)

print(
    f"Down clues: {len(puzzle['down'])}"
)

print(
    f"Numbered squares: {number_count}"
)

print()

print(
    "✅ Every answer matches the grid."
)

print(
    "✅ Every clue matches its answer."
)

print(
    "✅ Every clue number matches its position."
)

print(
    "✅ Shared Across/Down numbers are correct."
)

print(
    "✅ No one-letter entries."
)

print()

print(
    "Saved to puzzles/mini.json"
)