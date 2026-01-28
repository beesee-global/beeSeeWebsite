import React from 'react';
import { Video, Phone, Users } from 'lucide-react';

interface CustomFormatProps {
  value?: string;
  onChange?: (format: string) => void;
  error?: boolean;
  helperText?: string;
}

const CustomFormat: React.FC<CustomFormatProps> = ({ 
  value = '', 
  onChange,
  error = false,
  helperText = ''
}) => {
  // Format options
  const formatOptions = [
    { value: 'In-video interview', label: 'Video', icon: <Video className="w-5 h-5" /> },
    { value: 'In-phone interview', label: 'Phone', icon: <Phone className="w-5 h-5" /> },
    { value: 'In-person interview', label: 'In Person', icon: <Users className="w-5 h-5" /> }
  ];

  const handleFormatSelect = (format: string) => {
    onChange?.(format);
  };

  return (
    <div className="w-full">
      <div className="flex gap-3">
        {formatOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleFormatSelect(option.value)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : error
                ? 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-center items-center gap-2">
              <span className={value === option.value ? 'text-blue-600' : 'text-gray-600'}>
                {option.icon}
              </span>
              <span className={`text-sm font-medium ${value === option.value ? 'text-blue-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {helperText && (
        <p className={`mt-2 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default CustomFormat