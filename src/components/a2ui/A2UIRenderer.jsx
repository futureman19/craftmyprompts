import React from 'react';
import { ChevronRight, Image as ImageIcon, AlertTriangle, Send } from 'lucide-react';

/**
 * --- ATOMIC COMPONENT LIBRARY ---
 * These are the "Lego Bricks" the AI can use to build interfaces.
 * We map the abstract JSON types to these concrete React components.
 */

const AtomContainer = ({ children, style = {}, layout = 'col' }) => (
    <div className={`flex ${layout === 'row' ? 'flex-row gap-4' : 'flex-col gap-2'} ${style.className || ''}`} style={style.custom}>
        {children}
    </div>
);

const AtomCard = ({ title, children, variant = 'default' }) => (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${variant === 'outlined' ? 'bg-transparent border-slate-300 dark:border-slate-600' :
        variant === 'elevated' ? 'bg-white dark:bg-slate-800 shadow-md border-transparent' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
        {title && <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">{title}</h4>}
        <div className="space-y-3">{children}</div>
    </div>
);

const AtomText = ({ content, variant = 'body', color = 'default' }) => {
    const styles = {
        h1: "text-2xl font-bold text-slate-900 dark:text-white",
        h2: "text-xl font-bold text-slate-800 dark:text-slate-100",
        h3: "text-lg font-semibold text-slate-800 dark:text-slate-200",
        body: "text-sm text-slate-600 dark:text-slate-300 leading-relaxed",
        caption: "text-xs text-slate-400 uppercase tracking-wider font-bold",
        label: "text-xs font-medium text-slate-500 dark:text-slate-400"
    };

    const colors = {
        default: "",
        primary: "text-indigo-600 dark:text-indigo-400",
        danger: "text-red-500",
        success: "text-emerald-500"
    };

    return <div className={`${styles[variant] || styles.body} ${colors[color] || ''}`}>{content}</div>;
};

const AtomButton = ({ label, actionId, payload, variant = 'primary', icon, onAction }) => {
    const baseClass = "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95";
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20",
        secondary: "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600",
        ghost: "text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
    };

    return (
        <button
            onClick={() => onAction && onAction(actionId, payload)}
            className={`${baseClass} ${variants[variant] || variants.secondary}`}
        >
            {label}
            {icon === 'arrow' && <ChevronRight size={14} />}
            {icon === 'send' && <Send size={14} />}
        </button>
    );
};

const AtomImage = ({ src, alt, aspectRatio = 'video' }) => (
    <div className={`relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700 ${aspectRatio === 'square' ? 'aspect-square' :
        aspectRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-video'
        }`}>
        {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
                <ImageIcon size={24} />
            </div>
        )}
    </div>
);

const AtomInput = ({ label, name, placeholder, value, onChange }) => (
    <div className="space-y-1">
        {label && <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>}
        <input
            type="text"
            name={name}
            value={value || ''}
            onChange={(e) => onChange && onChange(name, e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
        />
    </div>
);

const AtomTable = ({ headers, rows }) => (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                    {headers && headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {rows && rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                        {Array.isArray(row) ? row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                {cell}
                            </td>
                        )) : Object.values(row).map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AtomSelect = ({ label, name, options, value, onChange }) => (
    <div className="space-y-1">
        {label && <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>}
        <select
            name={name}
            value={value || ''}
            onChange={(e) => onChange && onChange(name, e.target.value)}
            className="w-full p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
        >
            {options && options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

/**
 * --- MAIN RENDERER COMPONENT ---
 * Traverses the JSON tree and renders the corresponding atoms.
 */
const A2UIRenderer = ({ content, onAction, onInputChange }) => {

    // Recursive render function
    const renderComponent = (node, index) => {
        if (!node) return null;
        if (typeof node === 'string') return <AtomText key={index} content={node} />;

        const { type, props, children } = node;
        const key = index;

        // Map Children recursively
        const childElements = children ? children.map((child, i) => renderComponent(child, `${key}-${i}`)) : null;

        switch (type) {
            case 'Container':
                return <AtomContainer key={key} {...props}>{childElements}</AtomContainer>;
            case 'Card':
                return <AtomCard key={key} {...props}>{childElements}</AtomCard>;
            case 'Text':
                return <AtomText key={key} {...props} />;
            case 'Button':
                return <AtomButton key={key} {...props} onAction={onAction} />;
            case 'Image':
                return <AtomImage key={key} {...props} />;
            case 'Input':
                return <AtomInput key={key} {...props} onChange={onInputChange} />;
            case 'Table':
                return <AtomTable key={key} {...props} />;
            case 'Select':
                return <AtomSelect key={key} {...props} onChange={onInputChange} />;
            case 'Spacer':
                return <div key={key} className={`h-${props.size || 4}`} />;
            default:
                console.warn(`Unknown A2UI component type: ${type}`);
                return (
                    <div key={key} className="p-2 border border-dashed border-red-300 rounded bg-red-50 text-red-500 text-xs flex items-center gap-2">
                        <AlertTriangle size={12} /> Unknown Component: {type}
                    </div>
                );
        }
    };

    // Entry point: If content is an array, render list; if object, render root.
    if (Array.isArray(content)) {
        return <div className="space-y-4">{content.map((node, i) => renderComponent(node, i))}</div>;
    }

    return renderComponent(content, 'root');
};

export default A2UIRenderer;