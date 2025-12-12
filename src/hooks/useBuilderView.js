import { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth, APP_ID } from '../lib/firebase.js';
import { usePromptBuilder } from './usePromptBuilder.js';

export const useBuilderView = (user, initialData, clearInitialData, showToast, addToHistory, onLoginRequest) => {
    // 1. Initialize Core Logic (The Prompt Engine)
    const promptBuilder = usePromptBuilder();
    const { state, dispatch, generatedPrompt, currentData, detectedVars } = promptBuilder;

    // 2. View State (UI Controls)
    const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'
    
    // CTO UPDATE: Vibe Mode State
    // false = Pro Mode (Full Control), true = Vibe Mode (Simple/Beginner)
    const [isSimpleMode, setIsSimpleMode] = useState(false);

    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedSubcats, setExpandedSubcats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showTestModal, setShowTestModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    
    // 3. Save/Export State
    const [displayName, setDisplayName] = useState('');
    const [saveVisibility, setSaveVisibility] = useState('private');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [customPresets, setCustomPresets] = useState([]);
    
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

    // Fetch Custom Presets (Real-time)
    useEffect(() => {
        if (!user) {
            setCustomPresets([]);
            return;
        }
        const q = query(
            collection(db, 'artifacts', APP_ID, 'users', user.uid, 'presets'),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const presets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomPresets(presets);
        });
        return () => unsubscribe();
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
            await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'snippets'), {
                content: content,
                label: label,
                type: state.mode,
                promptUsed: generatedPrompt,
                createdAt: serverTimestamp()
            });
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

    const handleSaveAsPreset = async () => {
        if (!user) {
            onLoginRequest();
            return;
        }
        const name = prompt("Enter a name for this preset (e.g., 'My React Stack'):");
        if (!name) return;

        try {
            const presetData = {
                label: name,
                mode: state.mode,
                textSubMode: state.textSubMode || 'general',
                selections: state.selections,
                customTopic: state.customTopic || '',
                codeContext: state.codeContext || '',
                lang: state.selections.language?.[0]?.value || null,
                avatar_style: state.selections.avatar_style?.[0]?.value || null,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'presets'), presetData);
            showToast("Preset saved! Check the Presets menu.");
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
        if (saveVisibility === 'public' && !displayName && (!user.displayName || user.displayName === 'Guest')) {
             const name = prompt("Please enter a display name for the community:");
             if(name) { 
                 setDisplayName(name); 
                 if (auth.currentUser && user.uid !== 'demo') {
                    await updateProfile(auth.currentUser, { displayName: name }); 
                 }
             } else { return; }
        }
        
        setIsSaving(true);
        try {
            const saveData = {
                prompt: generatedPrompt,
                selections: state.selections,
                customTopic: state.customTopic,
                type: state.mode,
                textSubMode: state.mode === 'text' ? state.textSubMode : null,
                chainOfThought: state.chainOfThought,
                codeOnly: state.codeOnly,
                codeContext: state.codeContext,
                visibility: saveVisibility,
                negativePrompt: state.negativePrompt,
                referenceImage: state.referenceImage,
                targetModel: state.targetModel,
                loraName: state.loraName,
                seed: state.seed,
                createdAt: serverTimestamp()
            };
            
            await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_prompts'), saveData);
            addToHistory(generatedPrompt, state.mode);
            
            if (saveVisibility === 'public') {
                await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'), { 
                    ...saveData, 
                    authorId: user.uid, 
                    authorName: displayName || user.displayName || 'Anonymous', 
                    likes: 0 
                });
                showToast("Published & Saved!");
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
        mobileTab, setMobileTab, isSimpleMode, setIsSimpleMode, // <--- Exported Here
        activeCategory, setActiveCategory, expandedCategories, toggleCategory,
        expandedSubcats, toggleSubcatExpansion, searchTerm, setSearchTerm,
        showTestModal, setShowTestModal, showWizard, setShowWizard,
        displayName, setDisplayName, saveVisibility, setSaveVisibility, isSaving, copied, copiedJson,
        customPresets, contextUrl, setContextUrl, isFetchingContext,
        globalApiKey, globalOpenAIKey,
        // Actions
        handleTestClick, handleFetchContext, handleSaveSnippet, toggleSelection, applyPreset, 
        handleSaveAsPreset, handleCopy, handleCopyJSON, handleUnifiedSave, filteredData
    };
};