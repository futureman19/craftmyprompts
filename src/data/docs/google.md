# Google Prompting Guide (Gemini)

## Core Principles
1.  **Clear Instructions**: Be direct. Use natural language.
2.  **Delimiters**: Use triple quotes `"""` to separate data/text from instructions.
3.  **Role Definition**: "You are a helpful assistant."
4.  **Task Decomposition**: Break complex problems into smaller steps.
5.  **Multi-turn Context**: Gemini handles long contexts well; provide sufficient background.

## Example Structure
```text
Task: Classify the following text into positive, neutral, or negative.

Text: """
The product was okay, but the shipping was delayed.
"""

Analysis:
1. Product quality: Neutral
2. Shipping: Negative
3. Overall sentiment: Mixed/Neutral
```
