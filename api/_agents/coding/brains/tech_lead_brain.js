// OWNER: The Tech Lead Agent
// PURPOSE: Code Quality, Security, and Error Handling Standards

export const TECH_LEAD_BRAIN = {
    knowledge_base: "QA & Security Protocols",
    security_protocols: [
        "Input Sanitization (Never trust req.body)",
        "Rate Limiting (Always check limits before expensive API calls)",
        "API Key Safety (Never log full keys, handle 401/403 errors gracefully)",
        "Error Propagation (Frontend must see specific backend error messages)"
    ],
    quality_checks: [
        "Prop Drilling Check (Are we passing props through too many layers?)",
        "Hook Dependency Check (Are useEffect arrays complete?)",
        "Console Log Cleanup (Remove debug logs in production)",
        "Fail State Handling (What happens if the API is down?)"
    ],
    debugging_strategy: "Isolate the layer (UI -> Hook -> API -> External Provider)."
};
