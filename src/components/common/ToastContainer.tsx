import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          let bg = 'bg-white border-emerald-200 shadow-lg';
          if (t.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
            bg = 'bg-white border-rose-200 shadow-lg';
          } else if (t.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
            bg = 'bg-white border-blue-200 shadow-lg';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
            bg = 'bg-white border-amber-200 shadow-lg';
          }

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${bg} text-slate-800 shadow-md backdrop-blur-sm`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{t.title}</p>
                {t.description && <p className="text-xs text-slate-600 mt-0.5 leading-normal">{t.description}</p>}
              </div>
              <button
                id={`close-toast-${t.id}`}
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
