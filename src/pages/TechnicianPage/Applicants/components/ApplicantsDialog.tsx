import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import { styled } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { Send, MapPin, Clock, CalendarClock } from 'lucide-react';
import CustomTimePicker from '../../../../components/Fields/CustomTimePicker';
import CustomFormat from '../../../../components/Fields/CustomFormat';

interface ApplicantsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { 
    location: string;
    time: string[];
    date: string;
    schedule: string;
    format: string;
  }) => void;
  applicantName?: string;
  applicantEmail?: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': { width: '1000px', maxWidth: '95%' },
  '& .MuiDialogContent-root': { padding: theme.spacing(3) },
  '& .MuiDialogActions-root': { padding: theme.spacing(2) },
}));

const ApplicantsDialog: React.FC<ApplicantsDialogProps> = ({
  open,
  onClose,
  onSubmit,
  applicantName = '',
  applicantEmail = ''
}) => {
  const quickTimeOptions = ['11:00 AM', '2:00 PM'];

  const [formData, setFormData] = useState({ 
    location: '',
    time: [] as string[],
    date: '',
    schedule: '',
    format: ''
  });

  const [formError, setFormError] = useState<Record<string, string>>({});

  const getSelectedQuickTimes = () =>
    quickTimeOptions.filter((timeOption) => formData.time.includes(timeOption));

  const handleQuickTimeToggle = (timeOption: string) => {
    const selectedQuickTimes = getSelectedQuickTimes();
    const isAlreadySelected = selectedQuickTimes.includes(timeOption);

    const updatedTimes = isAlreadySelected
      ? selectedQuickTimes.filter((time) => time !== timeOption)
      : [...selectedQuickTimes, timeOption];

    setFormData((prev) => ({
      ...prev,
      time: updatedTimes,
    }));
    setFormError((prev) => ({ ...prev, time: '' }));
  };

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({ 
        location: '',
        time: [],
        date: '',
        schedule: '',
        format: ''
      });
      setFormError({});
    }
  }, [open]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(prev => ({ ...prev, [name]: '' }));
  };

  const parseTimeToMinute = (time:string) => {
    const [rawTime, meridiem] = time.trim().split(" ");
    const [rawHours, rawMinutes] = rawTime.split(":").map(Number);

    let hours = rawHours;
    const minutes = rawMinutes; 
      
    if (meridiem?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (meridiem?.toUpperCase() === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}; 
    
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    
    if (formData.time.length === 0) {
      errors.time = "Time is required";
    } else if (formData.time.length === 2) {
      const start = parseTimeToMinute(formData.time[0]);
      const end = parseTimeToMinute(formData.time[1]);

      if (start >= end) {
        errors.time = "End time must be later than start time";
      }
    }
    
    if (!formData.date.trim()) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date (formData.date);
      selectedDate.setHours(0,0,0,0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() < today.getTime()) {
        errors.date = "Past dates are not allowed";
      } else if (selectedDate.getTime() === today.getTime()) {
        errors.date = "Today's date is not allowed. Please select a future date.";
      }
    }
    
    if (!formData.schedule.trim()) {
      errors.schedule = "Message is required";
    }

    if (!formData.format.trim()) {
      errors.format = "Format is required";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <BootstrapDialog
      aria-labelledby="customized-dialog-title"
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
        onClose();
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, color: '#000', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
            <CalendarClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className='text-[20px]'>Schedule With {applicantName}</div> 
          </div>
        </div>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2, color: '#666' }}>
          Send an interview invitation to the applicant with all the necessary details.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="applicants-dialog-form" className="space-y-4"> 
          <div className='flex gap-4'>
            <div className="w-full max-w-sm space-y-2">             
              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Date *
                </label>
                <CustomTextField
                  name="date"
                  placeholder="Enter interview date"
                  value={formData.date}
                  onChange={handleTextChange}
                  multiline={false}
                  rows={1}
                  type="date"
                  error={!!formError.date}
                  helperText={formError.date} 
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Time *
                </label>
                <div className='mb-3 flex flex-wrap gap-2 w-full items-center justify-center'>
                  {quickTimeOptions.map((timeOption) => {
                    const isActive = getSelectedQuickTimes().includes(timeOption);

                    return (
                      <button
                        key={timeOption}
                        type="button"
                        onClick={() => handleQuickTimeToggle(timeOption)}
                        className={`rounded-md w-44 border px-4 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {timeOption}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Or choose another time
                  </label>
                  <CustomTimePicker 
                    value={formData.time.join(', ')}
                    onChange={(time) => {
                      setFormData(prev => ({ ...prev, time: time ? [time] : [] }));
                      setFormError(prev => ({ ...prev, time: '' }));
                    }}
                    placeholder="Select start time"
                    error={!!formError.time}
                    helperText={formError.time}
                  />
                </div>
              </div>

              {/* duration */}
              {/* <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Duration *
                </label>
                <CustomDuration 
                  value={formData.duration}
                  onChange={(duration) => {
                    setFormData(prev => ({ ...prev, duration}));
                    setFormError(prev => ({...prev, duration: ''}))
                  }}
                  placeholder="Select duration"
                  error={!!formError.duration}
                  helperText={formError.duration}
                />
              </div> */}
            </div>

            <div className="w-full max-w-xl space-y-2">
              {/* Format */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Interview Format *
                </label>
                <CustomFormat 
                  value={formData.format}
                  onChange={(format) => {
                    setFormData(prev => ({ ...prev, format }));
                    setFormError(prev => ({ ...prev, format: '' }));
                  }}
                  error={!!formError.format}
                  helperText={formError.format}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Interview Address *
                </label>
                <CustomTextField
                  name="location"
                  placeholder="Enter interview location"
                  value={formData.location}
                  onChange={handleTextChange}
                  multiline={false}
                  rows={1}
                  type="text"
                  error={!!formError.location}
                  helperText={formError.location}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message To {applicantName} *
                </label>
                <CustomTextField
                  name="schedule"
                  placeholder="Enter schedule details (e.g., Interview format, duration, etc.)"
                  value={formData.schedule}
                  onChange={handleTextChange}
                  multiline={true}
                  rows={3}
                  type="text"
                  error={!!formError.schedule}
                  helperText={formError.schedule}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="applicants-dialog-form"
          variant="contained"
          sx={{ 
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            background: 'linear-gradient(to right, #FCD000, #FCD000)',
            '&:hover': {
              background: 'linear-gradient(to right, #e6bc00, #e6bc00)',
            }
          }}
        >
          Send Interview request
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ApplicantsDialog;
