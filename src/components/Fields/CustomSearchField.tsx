import React, { useState } from 'react';
import { Search } from 'lucide-react'; // Font Awesome search icon

interface CustomSearchFieldProps { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomSearchField: React.FC<CustomSearchFieldProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text" 
        value={value}
        onChange={onChange}
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      {/* Icon inside input field */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search />
      </div>
    </div>
  );
};

export default CustomSearchField;
