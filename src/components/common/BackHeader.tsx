import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Home } from 'lucide-react';

interface BackHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  fallbackRoute?: string;
  rightElement?: React.ReactNode;
}

export const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  badge,
  fallbackRoute,
  rightElement,
}) => {
  const { navigateBack, navigateTo } = useApp();

  const handleBack = () => {
    if (fallbackRoute) {
      navigateTo(fallbackRoute);
    } else {
      navigateBack();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        <button
          id="btn-view-back"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all active:scale-95 shrink-0 min-h-[44px]"
          title="Orqaga qaytish"
          aria-label="Orqaga qaytish"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Orqaga</span>
        </button>

        <button
          id="btn-view-home"
          onClick={() => navigateTo('dashboard')}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 shadow-2xs transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Bosh sahifa / Asosiy panel"
          aria-label="Asosiy panelga qaytish"
        >
          <Home className="w-4 h-4" />
        </button>

        {(title || subtitle) && (
          <div className="min-w-0">
            {badge && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">
                {badge}
              </span>
            )}
            {title && (
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {rightElement && (
        <div className="flex items-center gap-2 shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
};
