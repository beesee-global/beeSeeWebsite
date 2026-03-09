import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

interface CustomSearchFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  onSuggestionSelect?: (value: string) => void;
  maxSuggestions?: number;
}

const CustomSearchField: React.FC<CustomSearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  suggestions = [],
  onSuggestionSelect,
  maxSuggestions = 6,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const keyword = value.trim().toLowerCase();
    const source = suggestions.filter(Boolean);

    if (!keyword) return source.slice(0, maxSuggestions);

    return source
      .filter((item) => item.toLowerCase().includes(keyword))
      .slice(0, maxSuggestions);
  }, [suggestions, value, maxSuggestions]);

  const showSuggestions = isFocused && filteredSuggestions.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 h-10 sm:h-11"
      />

      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search />
      </div>

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-md border border-gray-200 bg-white shadow-md max-h-56 overflow-y-auto">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSuggestionSelect?.(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSearchField;
