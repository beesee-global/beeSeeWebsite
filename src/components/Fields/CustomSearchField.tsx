import React, { useState } from 'react';
import { Search } from 'lucide-react'; // Font Awesome search icon

interface CustomSearchFieldProps { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; // ✅ optional placeholder
  className?: string; // ✅ Add className prop
}

const CustomSearchField: React.FC<CustomSearchFieldProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className = '' // ✅ Default empty string
}) => {
  return (
    <div className={`relative w-full ${className}`}> {/* ✅ Remove max-w-xs, add className */}
      <input
        type="text" 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 h-10 sm:h-11" // ✅ py-2.5 instead of py-3, add h-10 sm:h-11
      />
      {/* Icon inside input field */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search />
      </div>
    </div>
  );
};

export default CustomSearchField;
