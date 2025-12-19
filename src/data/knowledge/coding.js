export const CODING_KNOWLEDGE = {
  // ==================================================================================
  // 3. TEXT MODE (Coding)
  // ==================================================================================

  // --- Platform ---
  "GitHub": {
    "rule": "Use atomic commits with descriptive messages (imperative mood, e.g., 'Add login component').",
    "mechanic": "GitHub Actions workflows (.github/workflows) are the standard for CI/CD; ensure tests run on every PR.",
    "pitfall": "Committing secrets or .env files; always check .gitignore before pushing."
  },
  "GitLab": {
    "rule": "Utilize GitLab CI/CD pipelines (.gitlab-ci.yml), which are often more integrated than GitHub Actions.",
    "mechanic": "'Merge Request' reviews are the primary quality gate; enforcing approval rules prevents bad code from reaching main.",
    "pitfall": "Ignoring the built-in Container Registry; it simplifies Docker image management significantly."
  },
  "Vercel": {
    "rule": "Optimize for Edge Functions where possible to reduce cold start times.",
    "mechanic": "Vercel's 'Preview Deployments' are immutable; use them for stakeholder QA before merging.",
    "pitfall": "Misconfiguring 'Serverless Function Region'; ensure your database and functions are in the same region to minimize latency."
  },
  "AWS Lambda": {
    "rule": "Keep function size small to minimize cold starts.",
    "mechanic": "Use 'Layers' to share dependencies across multiple functions without bloating individual deployment packages.",
    "pitfall": "Forgetting to set IAM permissions correctly; 'Least Privilege' principle is mandatory."
  },
  "Docker": {
    "rule": "One process per container.",
    "mechanic": "Multi-stage builds drastically reduce final image size (e.g., compile in one stage, copy binary to a slim alpine image).",
    "pitfall": "Running containers as 'root'; always create a specific user in the Dockerfile for security."
  },
  
  // --- Stack & Libraries ---
  "React": {
    "rule": "Components must be pure functions regarding props; side effects belong in useEffect.",
    "mechanic": "Use 'Keys' correctly in lists to avoid DOM trashing and performance hits.",
    "pitfall": "Mutating state directly (state.value = 5) instead of using the setter, which breaks the UI lifecycle."
  },
  "Next.js": {
    "rule": "Understand the difference between Server Components and Client Components ('use client').",
    "mechanic": "Next.js 14+ caches fetch requests aggressively; use 'no-store' if you need real-time data.",
    "pitfall": "Importing server-only modules (like fs/database) into Client Components."
  },
  "Tailwind CSS": {
    "rule": "Adopt a 'Mobile-First' mindset using the `sm:`, `md:`, `lg:` prefixes.",
    "mechanic": "Use `@apply` sparingly; the utility-first philosophy promotes keeping classes in HTML for smaller bundle sizes.",
    "pitfall": "Creating an unrecognizable soup of classes; use components to abstract repetitive patterns."
  },
  "Three.js": {
    "rule": "Manage the render loop carefully; creating objects inside the `animate()` loop causes massive memory leaks.",
    "mechanic": "Use 'BufferGeometry' instead of standard Geometry for performance on complex models.",
    "pitfall": "Ignoring device pixel ratio, leading to blurry renders on high-DPI screens."
  },
  "Python": {
    "rule": "Follow PEP 8 style guidelines for readability.",
    "mechanic": "List comprehensions are faster and more pythonic than standard for-loops for simple operations.",
    "pitfall": "Mutable default arguments (e.g., `def func(list=[])`) persist across calls; use `None` instead."
  },
  "Solidity": {
    "rule": "Use the 'Checks-Effects-Interactions' pattern to prevent Reentrancy attacks.",
    "mechanic": "Gas optimization is paramount; packing variables into 32-byte slots saves money.",
    "pitfall": "Using `tx.origin` for authorization, which enables phishing attacks; use `msg.sender`."
  },
  "sCrypt (Bitcoin)": {
    "rule": "Understand the UTXO model; you are verifying state transitions, not computing state on-chain like EVM.",
    "mechanic": "The `assert()` function is the primary mechanism for enforcing logic constraints.",
    "pitfall": "Failing to verify the 'backtrace' (genesis heritage), allowing token forgery."
  },
  "SQL": {
    "rule": "Avoid `SELECT *`; always specify columns to reduce I/O.",
    "mechanic": "Indexing foreign keys improves JOIN performance significantly.",
    "pitfall": "Not sanitizing inputs (SQL Injection); strictly use parameterized queries."
  },
  "Rust": {
    "rule": "Ownership and Borrowing are not optional; understanding the stack vs. heap is required.",
    "mechanic": "The compiler error messages are helpful guides, not just errors; follow their suggestions.",
    "pitfall": "Fighting the borrow checker with `.clone()` everywhere instead of using references."
  },
  "Go": {
    "rule": "Simplicity over abstraction; Go prefers repetition over complex class hierarchies.",
    "mechanic": "Goroutines are cheap threads; use channels for safe communication between them.",
    "pitfall": "Ignoring errors; `if err != nil` is the heartbeat of Go code."
  },
  
  // --- Security ---
  "OWASP Top 10": {
    "rule": "Treat all user input as hostile; validate and sanitize at the boundary.",
    "mechanic": "Security is not a feature, it's a layer; implement defense in depth.",
    "pitfall": "Relying on client-side validation alone; it can be easily bypassed."
  },
  "Prevent SQL Injection": {
    "rule": "NEVER concatenate strings into SQL queries; always use parameterized queries or Prepared Statements.",
    "mechanic": "ORMs (like Prisma/TypeORM) usually handle this, but raw queries are still vulnerable.",
    "pitfall": "Assuming internal APIs don't need sanitization."
  },
  "Reentrancy Guard": {
    "rule": "Use a Mutex (lock) modifier on sensitive functions (withdrawals).",
    "mechanic": "Ensure state changes happen *before* the external call (Ether transfer).",
    "pitfall": "Trusting that 'transfer()' will fail; always check return values."
  },
  "Access Control": {
    "rule": "Apply `onlyOwner` or role-based modifiers to administrative functions.",
    "mechanic": "Renounce ownership after deployment if the contract should be trustless.",
    "pitfall": "Leaving initialization functions public and unprotected."
  },
  "Zero Trust": {
    "rule": "Never trust the network perimeter; authenticate every request.",
    "mechanic": "Identity is the new perimeter; use strong IAM policies.",
    "pitfall": "Hardcoding credentials in source code."
  },

  // --- Principles ---
  "SOLID Principles": {
    "rule": "Single Responsibility Principle is king; a class/function should have one reason to change.",
    "mechanic": "Dependency Inversion makes code testable by decoupling high-level logic from low-level details.",
    "pitfall": "Over-engineering; applying strict patterns to simple scripts increases complexity unnecessarily."
  },
  "DRY": {
    "rule": "'Don't Repeat Yourself'; abstract logic into functions if used more than twice.",
    "mechanic": "DRY applies to knowledge/logic, not just text; two code blocks can look different but represent the same business rule.",
    "pitfall": "WET (Write Everything Twice) leads to maintenance nightmares where you fix a bug in one place but miss the copy."
  },
  "Clean Code": {
    "rule": "Code is read 10x more than it is written; prioritize readability over cleverness.",
    "mechanic": "Meaningful variable names reduce the need for comments.",
    "pitfall": "Premature optimization; make it work, make it right, then make it fast."
  },
  "TDD": {
    "rule": "Write the test *before* the code; it forces you to design the API first.",
    "mechanic": "Red-Green-Refactor loop ensures you only write necessary code.",
    "pitfall": "Writing tests that match the implementation details rather than the behavior."
  },

  // --- Testing ---
  "Jest": {
    "rule": "Mock external dependencies to keep unit tests fast and deterministic.",
    "mechanic": "Snapshot testing is great for UI components but brittle for logic.",
    "pitfall": "Testing implementation details (e.g., checking internal state) instead of outputs."
  },
  "Cypress": {
    "rule": "E2E tests should replicate real user flows.",
    "mechanic": "Use `data-cy` attributes for selecting elements to make tests resilient to CSS/JS changes.",
    "pitfall": "Over-reliance on UI tests; they are slow and flaky compared to unit tests."
  },
  "Hardhat": {
    "rule": "Forking mainnet allows you to test against real-world state and DeFi protocols.",
    "mechanic": "`console.log` works inside Solidity when using Hardhat!",
    "pitfall": "Not testing revert conditions; always ensure your contract fails when it should."
  }
};