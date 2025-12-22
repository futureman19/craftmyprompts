# Anthropic Claude Prompting Guide

## Key Principles
1. **Be Clear and Direct**: detailed context, specific goals.
2. **Use XML Tags**: Structure prompts with `<task>`, `<context>`, `<examples>`, `<input>`.
3. **Chain of Thought**: Ask Claude to "think step-by-step" before answering in `<thinking>` tags.
4. **Prefill**: Start the assistant response to guide output (e.g. `{"`).

## Structure Template
```xml
<system_role>
You are an expert...
</system_role>

<context>
{{context_data}}
</context>

<task>
{{instructions}}
</task>

<output_format>
Return strictly JSON.
</output_format>
```
