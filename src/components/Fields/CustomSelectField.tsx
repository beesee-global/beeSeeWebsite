import React from 'react'
import { 
  Autocomplete,
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
  disabled?: boolean;
  freeSolo?: boolean;
  maxLength?: number;
}

const CustomSelectField: React.FC <CustomSelectFieldProps> = ({ 
  name,
  placeholder,
  value,
  onChange,
  icon,
  options,
  error = false,
  helperText = "",
  disabled = false,
  freeSolo = false,
  maxLength
 }) => {
  const textFieldSx = {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: "12px",
    "& .MuiOutlinedInput-root": {
      minHeight: '48px',
      fontSize: "14px",
      '& fieldset': {
        borderColor: error ? 'red' : 'rgba(255,255,255,0.24)',
      },
      '&:hover fieldset': {
        borderColor: error ? 'red' : 'rgba(253,204,0,0.45)',
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? 'red' : "#FCD000",
        boxShadow: '0 0 0 3px rgba(253, 204, 0, 0.16)'
      },
      "&.Mui-focused .MuiSvgIcon-root": {
        color: "#FCD000"
      },
    },
    "&. MuiInputLabel-root.Mui-focused": {
      color: "#000000"
    },
  };

  const selectedOption = options.find((option) => option.value === value) || null;

  const buildChangeEvent = (newValue: string | number) => ({
    target: { name, value: newValue },
  } as React.ChangeEvent<HTMLInputElement>);

  if (freeSolo) {
    return (
      <div className='w-full'>
        <Autocomplete<Option, false, false, true>
          freeSolo
          disabled={disabled}
          options={options}
          value={selectedOption || String(value || '')}
          inputValue={String(value || '')}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
          isOptionEqualToValue={(option, currentValue) => (
            typeof currentValue !== 'string' && option.value === currentValue.value
          )}
          onChange={(_, selectedValue) => {
            const newValue = typeof selectedValue === 'string'
              ? selectedValue
              : selectedValue?.value || '';

            onChange(buildChangeEvent(newValue));
          }}
          onInputChange={(_, inputValue, reason) => {
            if (reason === 'reset') return;
            onChange(buildChangeEvent(inputValue));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={name}
              placeholder={placeholder}
              margin='dense'
              fullWidth
              size='small'
              sx={textFieldSx}
              error={error}
              inputProps={{
                ...params.inputProps,
                maxLength,
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {icon && (
                      <InputAdornment position='end'>
                        {icon}
                      </InputAdornment>
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {helperText && (
          <p className='text-red-500 text-sm mt-1 ml-2'>{helperText}</p>
        )}
      </div>
    );
  }

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
      disabled={disabled}
      inputProps={{ maxLength }}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          if (!selected) {
            return <span className='text-gray-500'>{placeholder}</span>
          } 
          const selectOption = options.find((opt) => opt.value === selected)

          return selectOption ? selectOption.label : String(selected)
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
          value={option.value}
           sx={{ fontSize: '14px' }}
          >
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
