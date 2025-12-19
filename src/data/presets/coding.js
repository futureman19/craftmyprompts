export const CODING_PRESETS = [
    { 
        label: "Modern React Component", 
        lang: "React", 
        framework_version: "Next.js 14",
        task: "Write Code", 
        topic: "Create a reusable **{Component_Name}** using **{Tech_Stack}** (e.g., Tailwind, Framer Motion). It should handle **{User_Interaction}** and display **{Data_Source}**. Ensure it supports **{Theme_Mode}** (Light/Dark) and is fully accessible (WCAG)." 
    },
    { 
        label: "Bitcoin Smart Contract", 
        lang: "sCrypt", 
        task: "Write Smart Contract", 
        topic: "Write a stateful sCrypt contract for **{Use_Case}**. It must enforce that **{Condition}** is true before unlocking funds. Use the UTXO model. Validate that the input **{Input_Parameter}** matches the state hash." 
    },
    { 
        label: "Secure Python API", 
        lang: "Python", 
        framework_version: "Python 3.12",
        task: "Write Code", 
        topic: "Create a FastAPI POST endpoint '**{Endpoint_Path}**' that accepts **{Input_Model}**. Validate fields using Pydantic v2. Implement error handling for **{Error_Scenario}** and return a structured JSON response." 
    },
    { 
        label: "Solidity Safe Transfer", 
        lang: "Solidity", 
        task: "Write Smart Contract", 
        topic: "Write a secure function named '**{Function_Name}**' that transfers **{Asset_Type}**. Implement the Checks-Effects-Interactions pattern to prevent reentrancy. Add a modifier to restrict access to **{Role}**." 
    },
    { 
        label: "SQL Optimization", 
        lang: "SQL", 
        task: "Optimize", 
        topic: "Analyze the following query for performance bottlenecks: **{Paste_Query_Here}**. Focus on reducing **{Target_Metric}** (e.g., Execution Time). Suggest specific indexes for the **{Table_Name}** table." 
    },
    {
        label: "Unit Test Generation",
        lang: "TypeScript",
        task: "Write Unit Tests",
        topic: "Write comprehensive unit tests for **{Function_Name}** using **{Testing_Library}**. Include test cases for the Happy Path, **{Edge_Case_1}**, and **{Edge_Case_2}**. Mock any external calls to **{External_Service}**."
    }
];