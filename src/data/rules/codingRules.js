/**
 * Coding Stack Constraints & Best Practices
 * Defines hard technical limits and version-specific rules for code generation.
 * Used to validate stack selections and inject specific version constraints.
 */

export const CODING_RULES = {
    // --- WEB FRAMEWORKS ---
    "React": {
        "v18": { features: ["Concurrent Mode", "Automatic Batching"], deprecated: ["ReactDOM.render"] },
        "v19": { features: ["Server Actions", "useFormStatus", "useOptimistic"], required: "Next.js 14+" }
    },
    "Next.js": {
        "Pages Router (Legacy)": { structure: "/pages", data_fetching: ["getServerSideProps", "getStaticProps"] },
        "App Router (Modern)": { structure: "/app", data_fetching: ["async/await in Server Components"], restrictions: ["No 'use client' at root layout"] }
    },
    "Tailwind CSS": {
        "v3": { features: ["JIT Engine", "Arbitrary Values"], syntax: "className='w-[50px]'" }
    },

    // --- SYSTEMS & BACKEND ---
    "Python": {
        "3.12": { features: ["Improved Error Messages", "F-string improvements"], deprecated: ["distutils"] },
        "FastAPI": { required: ["Pydantic v2"], syntax: "model_dump() instead of dict()" }
    },
    "Solidity": {
        "0.8.x": { features: ["Built-in Overflow Protection"], deprecated: ["SafeMath library (redundant)"] },
        "Security": { required: ["Checks-Effects-Interactions Pattern"], audit_flags: ["tx.origin", "delegatecall"] }
    },
    "sCrypt": {
        "v2 (scrypt-ts)": { 
            required: ["extends SmartContract", "@prop() decorator", "@method() decorator"],
            restrictions: ["Stateless UTXO model", "Must verify hashOutputs"]
        }
    },

    // --- TESTING ---
    "Jest": {
        environment: ["jsdom (frontend)", "node (backend)"],
        syntax: ["describe", "it", "expect"]
    },
    "Hardhat": {
        network: ["hardhat (local)", "sepolia (testnet)", "mainnet"],
        console: "import 'hardhat/console.sol'"
    }
};