import React from 'react';
import { AlertTriangle, Check, XCircle } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-red-500' : 'bg-emerald-500';
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5`}>
      {type === 'error' ? <AlertTriangle size={20}/> : <Check size={20}/>}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100"><XCircle size={18}/></button>
    </div>
  );
};

export default Notification;