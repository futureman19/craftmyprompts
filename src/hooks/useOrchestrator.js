import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export const useOrchestrator = (user) => {
    const [memories, setMemories] = useState({});
    const [taskState, setTaskState] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // --- 1. MEMORY MANAGEMENT ---
    
    // Fetch all memories for the current user
    const fetchMemories = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_memories')
                .select('memory_key, memory_value');

            if (error) throw error;

            // Transform array [{memory_key: 'x', memory_value: 'y'}] into object {x: y}
            const memoryMap = {};
            data.forEach(item => {
                memoryMap[item.memory_key] = item.memory_value;
            });
            setMemories(memoryMap);
        } catch (err) {
            console.error("Orchestrator: Failed to fetch memories", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Save or Update a specific memory
    const remember = async (key, value) => {
        if (!user) return;
        
        // Optimistic UI update
        setMemories(prev => ({ ...prev, [key]: value }));

        try {
            const { error } = await supabase
                .from('user_memories')
                .upsert(
                    { user_id: user.uid, memory_key: key, memory_value: value },
                    { onConflict: 'user_id, memory_key' }
                );

            if (error) throw error;
        } catch (err) {
            console.error(`Orchestrator: Failed to remember ${key}`, err);
            // Revert on error? (Optional, but usually safe to ignore for non-critical prefs)
        }
    };

    // Forget a memory
    const forget = async (key) => {
        if (!user) return;
        
        const newMemories = { ...memories };
        delete newMemories[key];
        setMemories(newMemories);

        await supabase
            .from('user_memories')
            .delete()
            .eq('user_id', user.uid)
            .eq('memory_key', key);
    };

    // --- 2. CONTEXT CONSTRUCTION ---

    // Builds the "Virtual Context Window" string to inject into the LLM
    const constructSystemContext = (baseSystemPrompt = "") => {
        const memoryBlock = Object.entries(memories)
            .map(([k, v]) => `- ${k.toUpperCase()}: ${v}`)
            .join('\n');

        const contextWindow = `
${baseSystemPrompt}

### 🧠 MEMORY BLOCK (USER CONTEXT)
The following are persistent facts about the user. Use them to personalize your response.
${memoryBlock || "(No memories stored yet)"}

### 📋 CURRENT TASK STATE
${taskState ? JSON.stringify(taskState, null, 2) : "(No active complex task)"}
        `.trim();

        return contextWindow;
    };

    // --- 3. LIFECYCLE ---
    useEffect(() => {
        if (user) {
            fetchMemories();
        } else {
            setMemories({});
        }
    }, [user, fetchMemories]);

    return {
        memories,
        loading,
        remember,
        forget,
        constructSystemContext,
        setTaskState // Allow external tools to update the current task state
    };
};