import React, { useState, useEffect } from 'react';

interface CustomDateOfBirthProps {
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string; // ✅ make label customizable
  error?: boolean,
  helperText?: string;
}

const CustomDateOfBirth: React.FC<CustomDateOfBirthProps> = ({
  name,
  value,
  onChange,
  label = 'Date of Birth', // ✅ default fallback
  error = false, 
  helperText = "",
}) => {
  const today = new Date();
  const todayDay = today.getDate().toString();
  const todayMonth = (today.getMonth() + 1).toString();
  const todayYear = today.getFullYear().toString();

  const [selectedDay, setSelectedDay] = useState<string>(todayDay);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth);
  const [selectedYear, setSelectedYear] = useState<string>(todayYear);

  const [days, setDays] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    setDays(Array.from({ length: 31 }, (_, i) => (i + 1).toString()));
    setMonths(Array.from({ length: 12 }, (_, i) => (i + 1).toString()));
    const currentYear = new Date().getFullYear();
    setYears(Array.from({ length: currentYear - 1964 }, (_, i) => (1965 + i).toString()));
  }, []);

  // initialize default date value
  useEffect(() => {
    const dateValue = `${todayYear}-${todayMonth.padStart(2, '0')}-${todayDay.padStart(2, '0')}`;
    onChange?.({
      target: { name, value: dateValue },
    } as React.ChangeEvent<HTMLInputElement>);
  }, []);

  const handleChange = (type: 'day' | 'month' | 'year', val: string) => {
    let newDay = selectedDay;
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (type === 'day') newDay = val;
    if (type === 'month') newMonth = val;
    if (type === 'year') newYear = val;

    setSelectedDay(newDay);
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);

    const dateValue = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
    onChange?.({
      target: { name, value: dateValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className="flex items-center justify-between gap-5 border border-gray-300 hover:border-gray-700 py-2 px-4 rounded-md bg-[#f5f5f5]">
        {/* ✅ dynamic label */}
        <label className="w-32 mt-1 text-sm text-gray-500">
          {label}
        </label>

        <div className="flex gap-2">
          <select
            value={selectedDay}
            onChange={(e) => handleChange('day', e.target.value)}
            className="rounded px-1 py-1 bg-[#f5f5f5] outline-none border-none focus:ring-0"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => handleChange('month', e.target.value)}
            className="rounded px-1 py-1 bg-[#f5f5f5] outline-none border-none focus:ring-0"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleChange('year', e.target.value)}
            className="rounded px-1 py-1 bg-[#f5f5f5] outline-none border-none focus:ring-0"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      {helperText && (
        <p className='text-red-500 text-sm mt-1   ml-2'>{helperText}</p>
      )}
    </div>
  );
};

export default CustomDateOfBirth;
