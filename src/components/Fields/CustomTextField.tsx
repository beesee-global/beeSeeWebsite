import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface CustomTextFieldProps {
  name: string;
  placeholder: string;
  value: string | number;
  rows: number;
  type: string;
  maxLength?: number;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline: boolean;
  icon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  name,
  placeholder,
  value,
  onChange,
  multiline = false,
  maxLength,
  disabled,
  type,
  rows,
  icon,
  error = false,
  helperText = "",
}) => {
  const textFieldSx = {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: error ? 'red' : '#d1d5db', // gray-300 by default
      },
      '&:hover fieldset': {
        borderColor: error ? 'red' : '#9ca3af', // darker gray on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: error ? 'red' : '#FCD000',
      },
    },
    '& .MuiInputBase-inputMultiline': {
      paddingBottom: '10px',
      marginRight: '-10px',
      marginBottom: '15px',
      paddingRight: multiline && rows > 1 ? '30px' : '14px',
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // ✅ Capitalize first letter unless field is email
    if (!['email', 'password'].includes(name) && newValue.length > 0) {
      let firstWordProcessed = false;

      newValue = newValue.replace(/\S+/g, (word) => {
        let processedWord = word;

        // // Fully lowercase → allowed
        // if (/^[a-z]+$/.test(word)) {
        //   processedWord = word;
        // }
        // // Proper Capital Case → allowed
        // else if (/^[A-Z][a-z]*$/.test(word)) {
        //   processedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        // }
        // // Fully uppercase (acronyms) → allowed
        // else if (/^[A-Z]+$/.test(word)) {
        //   processedWord = word;
        // }
        // // Mixed case → force Capital Case
        // else {
        //   processedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        // }

        // Ensure the first word always starts with a capital letter
        if (!firstWordProcessed) {
          processedWord = processedWord.charAt(0).toUpperCase() + processedWord.slice(1);
          firstWordProcessed = true;
        }

        return processedWord;
      });
    }

    const syntheticEvent = {
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className="relative w-full">
      <TextField
        name={name}
        placeholder={placeholder}
        margin="dense"
        fullWidth
        type={type}
        size="small"
        disabled={disabled}
        rows={rows}
        multiline={multiline}
        sx={textFieldSx}
        value={value}
        onChange={handleChange}
        inputProps={{ maxLength }}
        error={error} 
        InputProps={{
          endAdornment:
            icon && !(multiline && rows > 1) ? (
              <InputAdornment position="end">{icon}</InputAdornment>
            ) : undefined,
        }}
      />

      {helperText && (
        <p className='text-red-500 text-sm mt-1   ml-2'>{helperText}</p>
      )}

      {/* ✅ Top-right icon for multiline fields */}
      {icon && multiline && rows > 1 && (
        <span
          style={{
            position: 'absolute',
            top: '20px',
            right: '12px',
            pointerEvents: 'none',
            color: '#9ca3af',
          }}
        >
          {icon}
        </span>
      )}

      {/* Character counter */}
      {multiline && rows > 1 && (
        <span className="absolute bottom-1 right-2 text-xs text-gray-500">
          {String(value).length}/{maxLength} characters
        </span>
      )}
    </div>
  );
};

export default CustomTextField;
