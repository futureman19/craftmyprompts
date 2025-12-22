# OpenAI Prompting Guide

## Key Principles
1. **Markdown Hierarchy**: Use `# Identity`, `## Instructions`, `## Constraints`.
2. **Role Separation**: distinct `system` (rules) vs `user` (data) messages.
3. **Delimiters**: Use triple quotes `"""` or backticks ` ``` ` to separate data.
4. **Reference**: Explicitly tell the model "Use the provided text...".

## Structure Template
```markdown
# Identity
You are an expert...

# Instructions
1. Step one...
2. Step two...

# Constraints
- No prose.
- Output JSON only.

# Context
"""
{{context_data}}
"""
```
