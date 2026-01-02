import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';


import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Clock, 
  Calendar 
} from 'lucide-react';


const CustomRangeDatePicker = () => {

    const [selectedRange, setSelectedRange] = useState('1d');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([oneDayAgo, now]);
  const [startDate, endDate] = dateRange;

  const timeRanges = [
    { label: 'Today', value: '1d', description: 'Last 24 hours' },
    { label: 'This Week', value: '7d', description: 'Last 7 days' },
    { label: 'This Month', value: '1m', description: 'Last 30 days' },
    { label: 'Last 3 Months', value: '3m', description: 'Last 90 days' },
    { label: 'This Year', value: '1y', description: 'Last 365 days' },
  ];

  const getCurrentTimeFrameLabel = () => {
    const currentRange = timeRanges.find(range => range.value === selectedRange);
    return currentRange ? currentRange.label : 'Custom Range';
  };

  const getDateRangeDisplay = () => {
    if (startDate && endDate) {
      if (startDate.toDateString() === endDate.toDateString()) {
        return format(startDate, 'MMM dd, yyyy');
      }
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }
    return 'Select dates';
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
    }
    
    setDateRange([startDate, endDate]);
    setIsCalendarOpen(false);
  };

  return (
    <div>
        {/* Date */}
        <div className="relative z-10"> 
        <div className="relative">
            <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border-2 border-yellow-400 text-gray-900 font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:bg-yellow-50 hover:border-yellow-500"
            >
            <Clock className="w-4 h-4 text-yellow-600" />
            <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                {getCurrentTimeFrameLabel()}
                </span>
                <span className="text-xs text-gray-500 leading-tight">
                {getDateRangeDisplay()}
                </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-yellow-600 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Calendar Dropdown */}
            {isCalendarOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl border-2 border-yellow-400 shadow-xl z-50 min-w-80 max-w-96">
                {/* Quick Select Section */}
                <div className="p-6 border-b border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Quick Select</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {timeRanges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleRangeChange(range.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedRange === range.value
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                        }`}
                    >
                        {range.label}
                    </button>
                    ))}
                </div>
                </div>

                {/* Calendar Section */}
                <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4">
                    <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                        setDateRange(update);
                        setSelectedRange('custom');
                    }}
                    inline
                    calendarClassName="border-0 shadow-none bg-transparent"
                    dayClassName={date =>
                        (date && ((startDate && date.toDateString() === startDate.toDateString()) || (endDate && date.toDateString() === endDate.toDateString())))
                        ? 'bg-yellow-400 text-gray-900 rounded-full font-semibold hover:bg-yellow-500' 
                        : 'hover:bg-yellow-100 rounded-full transition-colors duration-150'
                    }
                    renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
                        <div className="flex items-center justify-between px-2 py-2 mb-2">
                        <button 
                            onClick={decreaseMonth} 
                            className="text-yellow-600 px-2 py-1 rounded-lg hover:bg-yellow-100 transition-colors font-semibold"
                        >
                            ‹
                        </button>
                        <span className="font-semibold text-yellow-700">{format(monthDate, 'MMMM yyyy')}</span>
                        <button 
                            onClick={increaseMonth} 
                            className="text-yellow-600 px-2 py-1 rounded-lg hover:bg-yellow-100 transition-colors font-semibold"
                        >
                            ›
                        </button>
                        </div>
                    )}
                    />
                </div>
                {selectedRange === 'custom' && startDate && endDate && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">
                        Selected: {getDateRangeDisplay()}
                    </p>
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
        </div>
    </div>
  )
}

export default CustomRangeDatePicker
