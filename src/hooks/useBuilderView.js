import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';
import { usePromptBuilder } from './usePromptBuilder.js';


export const useBuilderView = (user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest) => {
    // 1. Initialize Core Logic (The Prompt Engine)
    const promptBuilder = usePromptBuilder();
    const { state, dispatch, generatedPrompt, currentData, detectedVars } = promptBuilder;

    // 2. View State (UI Controls)
    const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'

    // Vibe Mode State
    const [isSimpleMode, setIsSimpleMode] = useState(false);

    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedSubcats, setExpandedSubcats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showTestModal, setShowTestModal] = useState(false);

    // CTO UPDATE: Replaced Wizard state with Trend Widget state
    const [showTrendWidget, setShowTrendWidget] = useState(false);

    // 3. Save/Export State
    const [displayName, setDisplayName] = useState('');
    const [saveVisibility, setSaveVisibility] = useState('private');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [customPresets, setCustomPresets] = useState([]);
    const [customKnowledge, setCustomKnowledge] = useState([]); // New State for Knowledge

    // 4. Context Fetching State
    const [contextUrl, setContextUrl] = useState('');
    const [isFetchingContext, setIsFetchingContext] = useState(false);

    // Global Config
    const globalApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const globalOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY || '';

    // --- EFFECTS ---

    // Load Initial Data (Remix Feature)
    useEffect(() => {
        if (initialData) {
            dispatch({ type: 'LOAD_INITIAL_DATA', payload: initialData });
            showToast("Prompt loaded for remixing!");
            clearInitialData();
        }
    }, [initialData, dispatch, showToast, clearInitialData]);

    // Fetch Custom Presets & Knowledge (Supabase)
    const fetchUserData = async () => {
        if (!user) {
            setCustomPresets([]);
            setCustomKnowledge([]);
            return;
        }

        // Fetch Presets
        const { data: presetsData, error: presetsError } = await supabase
            .from('presets')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

        if (presetsError) console.error('Error loading presets:', presetsError);
        else setCustomPresets(presetsData || []);

        // Fetch Knowledge
        const { data: knowledgeData, error: knowledgeError } = await supabase
            .from('knowledge')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });

        if (knowledgeError) console.error('Error loading knowledge:', knowledgeError);
        else setCustomKnowledge(knowledgeData || []);
    };

    useEffect(() => {
        fetchUserData();
    }, [user]);

    // --- ACTIONS ---

    const handleTestClick = () => {
        if (!user) {
            showToast("Please log in to use the Test Runner.", "error");
            onLoginRequest();
            return;
        }
        setShowTestModal(true);
    };

    const handleFetchContext = async () => {
        if (!contextUrl) return;
        setIsFetchingContext(true);
        try {
            const response = await fetch('/api/fetch-context', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: contextUrl })
            });

            if (!response.ok) throw new Error("Failed to fetch content");
            const data = await response.json();

            const header = `\n// --- IMPORTED FROM: ${contextUrl} ---\n`;
            const newContent = (state.codeContext || '') + header + data.content;

            dispatch({ type: 'UPDATE_FIELD', field: 'codeContext', value: newContent });
            setContextUrl('');
            showToast("Context imported successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch URL. Ensure it's public.", "error");
        } finally {
            setIsFetchingContext(false);
        }
    };

    const handleSaveSnippet = async (content, label = 'AI Result') => {
        if (!user) {
            showToast("Please log in to save snippets.", "error");
            onLoginRequest();
            return;
        }
        try {
            // Supabase Insert
            const { error } = await supabase.from('snippets').insert({
                user_id: user.uid,
                content: content,
                label: label,
                type: state.mode,
                prompt_used: generatedPrompt,
                created_at: new Date().toISOString()
            });

            if (error) throw error;
            showToast("Result saved to Snippets!");
        } catch (e) {
            console.error("Error saving snippet:", e);
            showToast("Failed to save snippet.", "error");
        }
    };

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSubcatExpansion = (subName) => {
        setExpandedSubcats(prev => ({ ...prev, [subName]: !prev[subName] }));
    };

    const toggleSelection = (categoryId, option) => {
        // Smart Multi-Select Logic
        const singleSelectCategories = ['length', 'format', 'framework_version', 'params', 'framing', 'motion_strength'];
        const isSingleSelect = singleSelectCategories.includes(categoryId);
        dispatch({ type: 'TOGGLE_SELECTION', payload: { categoryId, option, isSingleSelect } });
    };

    const applyPreset = (preset) => {
        dispatch({ type: 'LOAD_PRESET', payload: preset });
        showToast(`Loaded preset: ${preset.label || 'Custom'}`);
    };

    const applyKnowledge = (item) => {
        // Appends the knowledge snippet to the "Code Context" field (used for general context)
        const header = `\n// --- KNOWLEDGE: ${item.title} ---\n`;
        const newContent = (state.codeContext || '') + header + item.content;

        dispatch({ type: 'UPDATE_FIELD', field: 'codeContext', value: newContent });
        showToast(`Applied knowledge: ${item.title}`);
    };

    const handleSaveAsPreset = async () => {
        if (!user) {
            onLoginRequest();
            return;
        }
        const name = prompt("Enter a name for this preset (e.g., 'My React Stack'):");
        if (!name) return;

        try {
            // CTO FIX: Added custom_topic and code_context to the insert payload
            const { error } = await supabase.from('presets').insert({
                user_id: user.uid,
                label: name,
                mode: state.mode,
                selections: state.selections,
                custom_topic: state.customTopic, // <--- Fixed: Saving Topic
                code_context: state.codeContext, // <--- Fixed: Saving Context
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            showToast("Preset saved! Check the Presets menu.");
            fetchUserData(); // Refresh list
        } catch (error) {
            console.error("Error saving preset:", error);
            showToast("Failed to save preset.", "error");
        }
    };

    const handleCopy = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        addToHistory(generatedPrompt, state.mode);
        setTimeout(() => setCopied(false), 2000);
        showToast("Copied to clipboard!");
    };

    const handleCopyJSON = () => {
        const dataToCopy = {
            meta: { app: "CraftMyPrompt", version: "1.0", mode: state.mode },
            prompt: generatedPrompt,
            structure: state.selections
        };
        navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
        showToast("JSON Data copied!");
    };

    const handleUnifiedSave = async () => {
        if (!user) {
            onLoginRequest();
            return;
        }

        // Handle Display Name Update (if public)
        if (saveVisibility === 'public' && !displayName && (!user.displayName || user.displayName === 'Guest')) {
            const name = prompt("Please enter a display name for the community:");
            if (name) {
                setDisplayName(name);
                // Update Supabase Meta
                await supabase.auth.updateUser({ data: { full_name: name } });
            } else { return; }
        }

        setIsSaving(true);
        try {
            const saveData = {
                user_id: user.uid,
                prompt: generatedPrompt,
                type: state.mode,
                sub_mode: state.mode === 'text' ? state.textSubMode : null,
                selections: state.selections,
                custom_topic: state.customTopic,
                reference_image: state.referenceImage,
                negative_prompt: state.negativePrompt,
                visibility: saveVisibility, // 'public' or 'private'
                author_name: displayName || user.displayName || 'Anonymous',
                // Pack technical configs into JSONB
                model_config: {
                    loraName: state.loraName,
                    seed: state.seed,
                    chainOfThought: state.chainOfThought,
                    codeOnly: state.codeOnly,
                    codeContext: state.codeContext,
                    targetModel: state.targetModel
                },
                created_at: new Date().toISOString()
            };

            // Supabase Insert (One table for both public/private)
            const { error } = await supabase.from('prompts').insert(saveData);

            if (error) throw error;

            addToHistory(generatedPrompt, state.mode);

            if (saveVisibility === 'public') {
                showToast("Published to Feed & Saved!");
            } else {
                showToast("Saved to Library!");
            }
        } catch (e) {
            console.error(e);
            showToast("Error saving prompt.", "error");
        }
        setIsSaving(false);
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return currentData;
        return currentData.map(cat => ({
            ...cat,
            subcategories: cat.subcategories.map(sub => ({
                ...sub,
                options: sub.options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
            })).filter(sub => sub.options.length > 0)
        })).filter(cat => cat.subcategories.length > 0);
    }, [searchTerm, currentData]);

    return {
        // Core Data
        state, dispatch, generatedPrompt, currentData, detectedVars,
        // UI State
        mobileTab, setMobileTab, isSimpleMode, setIsSimpleMode,
        activeCategory, setActiveCategory, expandedCategories, toggleCategory,
        expandedSubcats, toggleSubcatExpansion, searchTerm, setSearchTerm,
        showTestModal, setShowTestModal,

        // CTO UPDATE: Exporting Trend State instead of Wizard
        showTrendWidget, setShowTrendWidget,

        displayName, setDisplayName, saveVisibility, setSaveVisibility, isSaving, copied, copiedJson,
        customPresets, customKnowledge, contextUrl, setContextUrl, isFetchingContext,
        globalApiKey, globalOpenAIKey,
        // Actions
        handleTestClick, handleFetchContext, handleSaveSnippet, toggleSelection, applyPreset, applyKnowledge,
        handleSaveAsPreset, handleCopy, handleCopyJSON, handleUnifiedSave, filteredData
    };
};