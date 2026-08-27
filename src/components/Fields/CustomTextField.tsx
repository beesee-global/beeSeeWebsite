import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface CustomTextFieldProps {
  name: string;
  id?: string;
  placeholder: string;
  value: string | number;
  rows: number;
  type: string;
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline: boolean;
  icon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  name,
  id,
  placeholder,
  value,
  onChange,
  multiline = false,
  maxLength,
  disabled,
  type,
  autoComplete,
  rows,
  icon,
  error = false,
  helperText = "",
  onKeyDown,
  onPaste,
}) => {
  const textFieldSx = {
    backgroundColor: error ? '#fff1f2' : '#ffffff',
    borderRadius: '6px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: error ? 'red' : '#d1d5db',
      },
      '&:hover fieldset': {
        borderColor: error ? 'red' : '#9ca3af',
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
    // MUI supplies the gold focus border on the outer fieldset. Remove the
    // browser's inner blue focus outline so focused inputs have one clear
    // focus treatment.
    '& .MuiInputBase-input:focus, & .MuiInputBase-inputMultiline:focus, & textarea:focus': {
      outline: 'none',
      boxShadow: 'none',
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
        id={id}
        placeholder={placeholder}
        margin="dense"
        fullWidth
        type={type}
        autoComplete={autoComplete}
        size="small"
        disabled={disabled}
        rows={rows}
        multiline={multiline}
        sx={textFieldSx}
        value={value}
        onChange={handleChange}
        inputProps={{ 
          maxLength,
          onKeyDown,
          onPaste,
        }}
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
