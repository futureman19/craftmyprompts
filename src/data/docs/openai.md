# OpenAI Prompting Guide (GPT-4)

## Core Principles
1. **Clear Instructions**: Be explicit about what you want. "Do X, then Y."
2. **Reference to Roles**: "Act as a senior software engineer."
3. **Markdown Organization**: Use headers and bullet points in your instructions.
4. **Few-Shot Prompting**: Provide examples of input -> desired output to guide the model.

## Best Practices
- **Split Complex Tasks**: Break down big prompts into a series of steps.
- **Specify Output Format**: "Return the result as a JSON object with keys: foo, bar."
- **Context Handling**: Provide relevant background info before the main instruction.

## Example
```markdown
# Role
You are an expert copywriter.

# Task
Write a landing page headline for a new coffee brand.

# Constraints
- Under 10 words
- Punchy and emotional
- No puns
```
