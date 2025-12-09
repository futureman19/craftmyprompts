import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, X, Sparkles, Wand2 } from 'lucide-react';

const WizardMode = ({ isOpen, onClose, data, selections, onToggle, mode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState('forward');

  // Reset step when opening
  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter out categories that might be empty or irrelevant
  const steps = data.filter(cat => cat.subcategories && cat.subcategories.length > 0);
  const currentCategory = steps[currentStep];
  
  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    setDirection('forward');
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose(); // Finish
    }
  };

  const handleBack = () => {
    setDirection('backward');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col animate-in fade-in duration-300">
      
      {/* --- HEADER --- */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-lg">
            <Wand2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Prompt Wizard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          title="Exit Wizard"
        >
          <X size={24} />
        </button>
      </div>

      {/* --- PROGRESS BAR --- */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5">
        <div 
          className="bg-indigo-600 h-1.5 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Question / Category Title */}
          <div className="mb-8 text-center animate-in slide-in-from-bottom-4 duration-500 fade-in">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {currentCategory.title}
            </h3>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {currentCategory.description}
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
            {currentCategory.subcategories.map((sub) => (
              <div key={sub.name}>
                <h4 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-indigo-100 dark:border-slate-700 pb-2">
                  {sub.name}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sub.options.map((option) => {
                    const isSelected = selections[currentCategory.id]?.some(i => i.value === option);
                    
                    return (
                      <button
                        key={option}
                        onClick={() => onToggle(currentCategory.id, option)}
                        className={`
                          relative group flex flex-col items-start justify-between p-4 rounded-xl text-left border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-slate-500 hover:shadow-md'
                          }
                        `}
                      >
                        <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                          {option}
                        </span>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-indigo-600 dark:text-indigo-400">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER / CONTROLS --- */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
              ${currentStep === 0 
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            {currentStep === steps.length - 1 ? (
              <>Finish <Sparkles size={18} /></>
            ) : (
              <>Next <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default WizardMode;