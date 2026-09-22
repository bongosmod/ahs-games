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
Create a brand-new Connections-style word puzzle
for {today}.

The puzzle MUST contain:

- Exactly 4 groups
- Exactly 4 words in each group
- Exactly 16 total words
- Every word must belong to exactly one intended group
- Groups should have different difficulty levels
- The puzzle should contain misleading possible connections
- Words should be recognizable to a typical English-speaking player
- Do not use duplicate words
- Avoid extremely obscure words
- Avoid making multiple groups depend on the same obvious category
- Do not copy a famous existing Connections puzzle

Make the puzzle fun and challenging.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{{
    "date": "{today}",
    "groups": [
        {{
            "name": "GROUP NAME",
            "words": [
                "WORD",
                "WORD",
                "WORD",
                "WORD"
            ],
            "className": "group-yellow"
        }},
        {{
            "name": "GROUP NAME",
            "words": [
                "WORD",
                "WORD",
                "WORD",
                "WORD"
            ],
            "className": "group-green"
        }},
        {{
            "name": "GROUP NAME",
            "words": [
                "WORD",
                "WORD",
                "WORD",
                "WORD"
            ],
            "className": "group-blue"
        }},
        {{
            "name": "GROUP NAME",
            "words": [
                "WORD",
                "WORD",
                "WORD",
                "WORD"
            ],
            "className": "group-purple"
        }}
    ]
}}

The four className values MUST be:

group-yellow
group-green
group-blue
group-purple
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


if "date" not in puzzle:
    raise ValueError(
        "Puzzle is missing date."
    )


if "groups" not in puzzle:
    raise ValueError(
        "Puzzle is missing groups."
    )


if len(puzzle["groups"]) != 4:
    raise ValueError(
        "Puzzle must contain exactly 4 groups."
    )


all_words = []


for group in puzzle["groups"]:

    if "name" not in group:
        raise ValueError(
            "Group is missing name."
        )


    if "words" not in group:
        raise ValueError(
            "Group is missing words."
        )


    if len(group["words"]) != 4:
        raise ValueError(
            "Every group must contain exactly 4 words."
        )


    all_words.extend(
        group["words"]
    )


if len(all_words) != 16:
    raise ValueError(
        "Puzzle must contain exactly 16 words."
    )


if len(set(all_words)) != 16:
    raise ValueError(
        "Puzzle contains duplicate words."
    )


os.makedirs(
    "puzzles",
    exist_ok=True
)


with open(
    "puzzles/connections.json",
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        puzzle,
        file,
        indent=4
    )


print("====================================")
print("NEW CONNECTIONS PUZZLE GENERATED!")
print("====================================")
print(
    f"Date: {puzzle['date']}"
)


for group in puzzle["groups"]:

    print()

    print(
        group["name"]
    )

    print(
        ", ".join(
            group["words"]
        )
    )


print()
print(
    "Saved to puzzles/connections.json"
)