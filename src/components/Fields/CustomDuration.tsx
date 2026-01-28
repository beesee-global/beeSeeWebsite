import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CustomDurationProps {
  value?: string;
  onChange?: (duration: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

const CustomDuration: React.FC<CustomDurationProps> = ({ 
  value = '', 
  onChange,
  placeholder = 'Select duration',
  error = false,
  helperText = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Duration options in minutes
  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1 hour 30 minutes' },
    { value: '120', label: '2 hours' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDurationSelect = (duration: string) => {
    onChange?.(duration);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    const selected = durationOptions.find(opt => opt.value === value);
    return selected ? selected.label : '';
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full pl-10 pr-10 py-3 text-left bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
              : 'border-gray-300 hover:border-gray-400 focus:ring-blue-200 focus:border-blue-500'
          }`}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {getDisplayLabel() || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${error ? 'text-red-500' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>

      {helperText && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDurationSelect(option.value)}
              className={`w-full px-4 py-2.5 text-left transition-colors duration-150 focus:outline-none ${
                value === option.value 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDuration