import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { languagesList } from '../../data/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'pills';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'pills') {
    return (
      <div id="language-switcher-pills" className={`inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 ${className}`}>
        {languagesList.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-pill-${lang.code}`}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        id="language-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold transition-colors border border-slate-200 min-h-[34px] sm:min-h-[38px] shadow-2xs shrink-0"
        aria-label="Select language"
        title="Tilni tanlash / Выбор языка / Select language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-black">{currentLang.short}</span>
        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Til / Язык / Lang
            </span>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="p-1 space-y-0.5">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
