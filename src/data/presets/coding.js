export const CODING_PRESETS = [
    { 
        label: "Modern React Component", 
        lang: "React", 
        framework_version: "Next.js 14",
        task: "Write Code", 
        topic: "Create a responsive {Component Name} using Tailwind CSS. It should {Functionality}. Use Server Components where possible." 
    },
    { 
        label: "Bitcoin Smart Contract", 
        lang: "sCrypt", 
        task: "Write Smart Contract", 
        topic: "Create a stateful contract for {Contract Logic} where {Condition}. Use the UTXO model and ensure inputs are validated." 
    },
    { 
        label: "Secure Python API", 
        lang: "Python", 
        framework_version: "Python 3.12",
        task: "Write Code", 
        topic: "Create a POST endpoint '{Endpoint}' that validates input using Pydantic v2. Ensure {Validation Rule} and implement proper error handling." 
    },
    { 
        label: "Solidity Safe Transfer", 
        lang: "Solidity", 
        task: "Write Smart Contract", 
        topic: "Write a secure '{Function Name}' function that follows the Checks-Effects-Interactions pattern to prevent reentrancy attacks." 
    },
    { 
        label: "SQL Optimization", 
        lang: "SQL", 
        task: "Optimize", 
        topic: "Analyze this query for performance bottlenecks and suggest specific indexes to improve execution time: {Insert Query Here}" 
    },
    {
        label: "Unit Test Generation",
        lang: "TypeScript",
        task: "Write Unit Tests",
        topic: "Write comprehensive unit tests for the following function using Jest. Include edge cases and error states: {Insert Code Here}"
    }
];