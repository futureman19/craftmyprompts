# Google Gemini Prompting Guide

## Key Principles
1. **Task/Role Definition**: Explicitly state "Your task is..."
2. **Negative Constraints**: Explicitly state what NOT to do.
3. **Clear Delimiters**: Use clear headers.
4. **Safety**: Gemini is sensitive to safety; avoid ambiguous framing.

## Structure Template
Role: Expert Coder.
Task: Write a function to...

Constraints:
- Do NOT use external libraries.
- Do NOT add comments.

Input:
{{context_data}}
