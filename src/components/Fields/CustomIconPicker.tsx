import React, { useState, useEffect, useMemo } from "react";
import { icons, Search, X, LucideIcon } from "lucide-react";

interface CustomIconPickerProps {
  value?: string; // currently selected icon name
  onChange: (iconName: string) => void;
  label?: string;
  error?: string;
}

// Dynamically extract all available icon names directly from lucide-react
const ALL_LUCIDE_ICONS = Object.keys(icons);

const CustomIconPicker: React.FC<CustomIconPickerProps> = ({
  value,
  onChange,
  label = "Select Icon",
  error,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(value || "");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (value !== undefined) {
      setSelectedIcon(value);
    }
  }, [value]);

  const handleSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onChange(iconName);
  };

  // Filter all dynamic Lucide icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return ALL_LUCIDE_ICONS;
    const query = searchQuery.toLowerCase().trim();
    return ALL_LUCIDE_ICONS.filter((iconName) =>
      iconName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Selected Icon Component lookup
  const SelectedIconComponent = selectedIcon
    ? (icons[selectedIcon as keyof typeof icons] as LucideIcon)
    : null;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all icons..."
          className="w-full pl-9 pr-8 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 min-h-[10rem] max-h-64 overflow-y-auto p-2.5 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        {filteredIcons.length > 0 ? (
          filteredIcons.map((iconName) => {
            const IconComponent = icons[iconName as keyof typeof icons] as LucideIcon;

            if (!IconComponent) return null;

            const isSelected = selectedIcon === iconName;

            return (
              <button
                type="button"
                key={iconName}
                title={iconName}
                onClick={() => handleSelect(iconName)}
                className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1.5 transition text-left focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium"
                    : "border-gray-200 dark:border-gray-700 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 text-gray-700 dark:text-gray-300"
                }`}
              >
                <IconComponent className="w-6 h-6 flex-shrink-0" />
                <span className="text-[10px] leading-tight text-center break-words w-full">
                  {iconName}
                </span>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No icons found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="flex items-center gap-2 mt-1 p-2 rounded-md bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Selected:</p>
          {SelectedIconComponent && (
            <SelectedIconComponent size={18} className="text-amber-600 dark:text-amber-500" />
          )}
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-500">
            {selectedIcon}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomIconPicker;