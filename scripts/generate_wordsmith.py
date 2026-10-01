import os
import json
from datetime import datetime
from zoneinfo import ZoneInfo

from openai import OpenAI


# =========================================
# SETTINGS
# =========================================

OUTPUT_FILE = "puzzles/wordsmith.json"

TIMEZONE = ZoneInfo("America/New_York")

MODEL = "gpt-4.1-mini"


# =========================================
# GET TODAY'S DATE
# =========================================

today = datetime.now(TIMEZONE).strftime("%Y-%m-%d")


# =========================================
# OPENAI
# =========================================

api_key = os.environ.get("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError(
        "OPENAI_API_KEY environment variable is missing."
    )


client = OpenAI(
    api_key=api_key
)


# =========================================
# GENERATE WORD
# =========================================

prompt = """
You are generating the daily answer for a Wordle-style game
called Wordsmith.

Generate exactly ONE answer.

Requirements:

- Exactly 5 letters.
- Must be a real English word.
- Must contain only A-Z letters.
- No proper nouns.
- No abbreviations.
- No hyphens.
- No apostrophes.
- No numbers.
- No extremely obscure, archaic, or obsolete words.
- Appropriate for high-school students.
- It should be challenging but reasonably guessable.
- The word must be a valid Wordle-style answer.

Return ONLY valid JSON in this exact format:

{
    "word": "XXXXX"
}

Do not include markdown.
Do not include explanations.
Do not include any additional fields.
"""


print("Generating today's Wordsmith word...")
print(f"Date: {today}")


response = client.responses.create(
    model=MODEL,
    input=[
        {
            "role": "system",
            "content": (
                "You are a careful word-game editor. "
                "Follow the requested JSON format exactly."
            )
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
)


# =========================================
# READ RESPONSE
# =========================================

raw_output = response.output_text.strip()

print("AI response:")
print(raw_output)


try:

    data = json.loads(raw_output)

except json.JSONDecodeError as error:

    raise RuntimeError(
        "OpenAI did not return valid JSON."
    ) from error


# =========================================
# VALIDATE WORD
# =========================================

word = str(
    data.get("word", "")
).strip().upper()


if len(word) != 5:

    raise RuntimeError(
        f"Generated word must contain exactly 5 letters. "
        f"Received: {word}"
    )


if not word.isalpha():

    raise RuntimeError(
        f"Generated word contains invalid characters: {word}"
    )


if not word.isascii():

    raise RuntimeError(
        f"Generated word contains non-English characters: {word}"
    )


# =========================================
# CREATE FINAL PUZZLE DATA
# =========================================

puzzle = {
    "date": today,
    "word": word
}


# =========================================
# MAKE SURE DIRECTORY EXISTS
# =========================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)


# =========================================
# WRITE JSON
# =========================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        puzzle,
        file,
        indent=4
    )

    file.write("\n")


# =========================================
# DONE
# =========================================

print("")
print("=========================================")
print("WORDSMITH GENERATED SUCCESSFULLY")
print("=========================================")
print(f"Date: {today}")
print(f"Word: {word}")
print(f"Saved to: {OUTPUT_FILE}")
print("=========================================")
