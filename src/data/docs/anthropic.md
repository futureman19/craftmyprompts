# Anthropic Prompting Guide (Claude)

## Core Principles
1. **XML Tags**: Use XML tags (e.g., `<input>`, `<instructions>`) to structure the prompt. This helps Claude separate instructions from data.
2. **Chain of Thought**: Ask Claude to "Think step-by-step" or use `<thinking>` tags before the `<answer>`.
3. **Role Prompting**: Assign a strict persona ("You are an expert physicist").
4. **Clear Delimiters**: Use triple quotes `"""` or other distinct separators for input text.

## Example Structure
```xml
<system>
You are a helpful assistant.
</system>

<user>
<context>
The user is asking about quantum mechanics.
</context>

<instruction>
Explain the concept of superposition simply.
Thinking step-by-step in <thinking> tags before answering.
</instruction>
</user>
```
