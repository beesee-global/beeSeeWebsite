import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, InputAdornment } from '@mui/material';
import axios from 'axios';

interface Country {
  name: { common: string };
  idd: { root: string; suffixes: string[] };
  cca2: string;
}

interface PhoneValue {
  phone_number: string;
  country_code: string;
  country_name: string;
}

interface CustomPhoneFieldProps {
  name: string;
  value: PhoneValue;
  placeholder?: string;
  onChange: (e: { target: { name: string; value: PhoneValue } }) => void;
  maxLength?: number;
  icon?: React.ReactNode;
  type: string;
  error?: boolean;
  helperText?: string;
}

// Typing for IP API response
interface IPResponse {
  country_code: string;
}

const CustomPhoneField: React.FC<CustomPhoneFieldProps> = ({
  name,
  value,
  placeholder,
  onChange,
  maxLength = 10,
  icon,
  type,
  error,
  helperText
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [defaultSet, setDefaultSet] = useState(false);

useEffect(() => {
  const fetchDataCode = async () => {
    try {
      const res = await axios.get<Country[]>(
        'https://restcountries.com/v3.1/all?fields=name,idd,cca2'
      );
      const data: Country[] = res.data
        .filter((c: Country) => c.idd?.root)
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
      setCountries(data);

      if (!defaultSet && !value.country_code && !value.country_name) {
        const ipRes = await axios.get<IPResponse>('https://ipapi.co/json/');
        const userCountry = data.find(
          (c: Country) => c.cca2 === ipRes.data.country_code
        );

        const defaultCountry = userCountry || data[0];  
        const defaultCode = `${defaultCountry.idd.root}${
          defaultCountry.idd.suffixes?.[0] || ''
        }`;
        const defaultName = defaultCountry.name.common;

        console.log('Setting default country:', defaultCode, defaultName);

        onChange({
          target: {
            name,
            value: {
              ...value,
              country_code: defaultCode,
              country_name: defaultName,
            },
          },
        });

        setDefaultSet(true);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  fetchDataCode();
}, [defaultSet]);


  // Handle user selecting a country
  const handleCountryChange = (code: string, name: string) => {
    // Remove alert in production
    onChange({
      target: {
        name,
        value: {
          ...value,
          country_code: code,
          country_name: name,
        },
      },
    });
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > maxLength) val = val.slice(0, maxLength);

    onChange({
      target: {
        name,
        value: {
          ...value,
          phone_number: val,
        },
      },
    });
  };

  return (
    <div className='w-full'>
        <div 
        className={`flex items-start w-full bg-[#f5f5f5] rounded-[6px] 
        overflow-hidden border focus-within:border-yellow-400 
        focus-within:hover:border-yellow-400 group ${
          error ? 'border-red-500' : ' border-gray-300 hover:border-gray-700'
        }`}
      >
        {/* Country select */}
        <TextField
          select
          size="small"
          value={value.country_code || ''}
          onChange={(e) => {
            const selectedCode = e.target.value;
            const selectedCountry = countries.find(
              (c: Country) => `${c.idd.root}${c.idd.suffixes?.[0] || ''}` === selectedCode
            );
            handleCountryChange(selectedCode, selectedCountry?.name.common || '');
          }}
          sx={{
            '& fieldset': { border: 'none' },
            '& .MuiSelect-select': { padding: '8px 12px' },
            minWidth: '100px',
            borderRight: '1px solid #d1d5db',
            backgroundColor: '#f5f5f5',
          }}
          SelectProps={{
            renderValue: (selected) => (selected ? String(selected) : ''),
          }}
        >
          {countries.map((c: Country) => {
            const code = `${c.idd.root}${c.idd.suffixes?.[0] || ''}`;
            return (
              <MenuItem key={c.cca2} value={code}>
                {c.name.common} ({code})
              </MenuItem>
            );
          })}
        </TextField>

        {/* Phone Input */}
        <TextField
          size="small"
          type={type}
          placeholder={placeholder}
          value={value.phone_number}
          onChange={handlePhoneChange}
          sx={{
            '& fieldset': { border: 'none' },
            flex: 1,
            backgroundColor: '#f5f5f5',
          }}
          inputProps={{ maxLength }}
          InputProps={{
            endAdornment: icon ? (
              <InputAdornment position="end">
                <span className="text-gray-500 group-focus-within:text-yellow-400 transition-colors">
                  {icon}
                </span>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </div>
      {/* Helper Text */}
      {helperText && (
        <p className="text-red-500 text-sm mt-1 ml-2">{helperText}</p>
      )}
    </div>
  );
};

export default CustomPhoneField;
