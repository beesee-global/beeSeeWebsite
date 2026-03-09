import React from 'react'
import { 
  TextField, 
  MenuItem, 
  InputAdornment 
} from "@mui/material"

interface Option {
  value: string,
  label: string,
  is_active?: string | boolean
}

interface CustomSelectFieldProps {
  name: string,
  placeholder: string,
  value: string | number,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: React.ReactNode;
  options: Option[];
  error?: boolean;
  helperText?: string;
}

const CustomSelectField: React.FC <CustomSelectFieldProps> = ({ 
  name,
  placeholder,
  value,
  onChange,
  icon,
  options,
  error = false,
  helperText = ""
 }) => {

  const textFieldSx = {
    backgroundColor: "#f5f5f5",
    borderRadius: "6px",
    "& .MuiOutlinedInput-root": {
      '& fieldset': {
        borderColor: error ? 'red' : '#d1d5db', // gray-300 by default
      },
      '&:hover fieldset': {
        borderColor: error ? 'red' : '#9ca3af', // darker gray on hover
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? 'red' : "#FCD000"
      },
      "&.Mui-focused .MuiSvgIcon-root": {
        color: "#FCD000"
      },
    },
    "&. MuiInputLabel-root.Mui-focused": {
      color: "#000000"
    },
  };

  return (
    <div className='w-full'>
      <TextField
      select
      name={name}
      fullWidth
      margin='dense'
      size='small'
      value={value}
      sx={textFieldSx}
      onChange={onChange}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          if (!selected) {
            return <span className='text-gray-500'>{placeholder}</span>
          } 
          const selectOption = options.find((opt) => opt.value === selected)

          return selectOption ? selectOption.label : selected
        },
      }}
      InputProps={{
        endAdornment: icon ? (
          <InputAdornment position='end'>
            <span className='text-gray-500'>|</span>
          </InputAdornment>
        ): undefined,
      }}
    >
      {options.length > 0 ? 
        options.map((option) => (
        <MenuItem 
          key={option.value} 
          value={option.value}>
          {option.label}
        </MenuItem>
      ))
      : (
        <span className='flex items-center justify-center text-gray-400'>
          No option
        </span>
      )}
    </TextField>
    {helperText && (
        <p className='text-red-500 text-sm mt-1 ml-2'>{helperText}</p>
      )}
    </div>
  )
}

export default CustomSelectField
