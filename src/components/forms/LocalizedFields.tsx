import { useState } from 'react';
import { FEATURES } from '@/config/features';
import type { LocalizedString } from '@/types/api';

interface LocalizedFieldsProps {
  label: string;
  value: LocalizedString;
  onChange: (val: LocalizedString) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: {
    en?: string;
    om?: string;
    am?: string;
  };
  error?: string;
  required?: boolean;
}

type LangTab = 'en' | 'om' | 'am';

export function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  error,
  required = false,
}: LocalizedFieldsProps) {
  const [activeTab, setActiveTab] = useState<LangTab>('en');

  // Enforce strictly 3 tabs EN | OM | AM when multilingualContent is false
  const availableTabs: { id: LangTab; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'EN' },
    { id: 'om', label: 'Afaan Oromoo', sub: 'OM' },
    { id: 'am', label: 'Amharic', sub: 'AM' },
  ];

  const handleTextChange = (lang: LangTab, text: string) => {
    onChange({
      ...value,
      [lang]: text,
    });
  };

  const currentValue = value[activeTab] || '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {/* Language Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
          {availableTabs.map((tab) => {
            const hasContent = Boolean(value[tab.id]?.trim());
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-white text-[#0B3D2E] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{tab.sub}</span>
                {hasContent && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-[#C9A24A]' : 'bg-slate-300'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            rows={rows}
            value={currentValue}
            onChange={(e) => handleTextChange(activeTab, e.target.value)}
            placeholder={placeholder?.[activeTab] || `Enter ${label} in ${activeTab.toUpperCase()}`}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all resize-y ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleTextChange(activeTab, e.target.value)}
            placeholder={placeholder?.[activeTab] || `Enter ${label} in ${activeTab.toUpperCase()}`}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all ${
              error ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
