import React from 'react';
import { SUPPORT_CATEGORIES, type SupportCategory } from '../../data/helpAssistantData';

interface CategorySidebarProps {
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const troubleshootingCategories = SUPPORT_CATEGORIES.filter((c) => !c.isInfoOnly);
  const infoCategories = SUPPORT_CATEGORIES.filter((c) => c.isInfoOnly);

  const renderCategoryButton = (category: SupportCategory) => {
    const isSelected = selectedCategoryId === category.id;
    return (
      <button
        key={category.id}
        onClick={() => onSelectCategory(category.id)}
        className={`w-full text-left px-3.5 py-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 group ${
          isSelected
            ? 'bg-[#fe9832] text-[#542900] border-[#fe9832] font-black shadow-md scale-[1.01]'
            : 'bg-white dark:bg-[#151c28] border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white hover:border-[#fe9832]/50 hover:bg-[#fe9832]/5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'bg-black/15 text-[#542900]'
                : 'bg-[#f1f4f6] dark:bg-[#0c121e] text-[#fe9832]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
          </div>

          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">{category.name}</span>
            <span
              className={`text-[10px] block truncate ${
                isSelected ? 'text-[#542900]/80' : 'text-[#45474c] dark:text-[#828796]'
              }`}
            >
              {category.problems.length} topics
            </span>
          </div>
        </div>

        <span
          className={`material-symbols-outlined text-[16px] shrink-0 transition-transform ${
            isSelected ? 'translate-x-0.5 text-[#542900]' : 'text-gray-400 group-hover:text-[#fe9832]'
          }`}
        >
          chevron_right
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5 font-['Inter',sans-serif]">
      {/* Troubleshooting Categories */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#45474c] dark:text-[#828796] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Problem Troubleshooting</span>
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">Priority</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {troubleshootingCategories.map(renderCategoryButton)}
        </div>
      </div>

      {/* Information Categories */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e3e5] dark:border-[#243044]">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#45474c] dark:text-[#828796] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>General Knowledge</span>
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">Info</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {infoCategories.map(renderCategoryButton)}
        </div>
      </div>
    </div>
  );
};
