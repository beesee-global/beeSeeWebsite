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
import CustomFormat, { VIDEO_INTERVIEW_FORMAT, VIDEO_INTERVIEW_LINK } from '../../../../components/Fields/CustomFormat';

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
  const [formData, setFormData] = useState({ 
    location: '',
    time: [] as string[],
    date: '',
    schedule: '',
    format: ''
  });

  const [formError, setFormError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const greetingName = applicantName || 'Applicant';
      setFormData((prev) => ({
        ...prev,
        schedule: prev.schedule || `Dear ${greetingName},\n\nWe would like to invite you for an interview. Please choose one of the available time options above.\n\nWe look forward to speaking with you.`
      }));
    }

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
  }, [open, applicantName]);

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
    
    if (formData.time.length !== 2) {
      errors.time = "Select exactly two interview time options";
    } else {
      const selectedMinutes = formData.time.map(parseTimeToMinute);
      if (selectedMinutes[0] === selectedMinutes[1]) {
        errors.time = "Choose two different interview times";
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
          Send an interview invitation to {applicantName || 'the applicant'} with all the necessary details.
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
                  Time options *
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[0, 1].map((index) => (
                    <div key={index}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {index === 0 ? '1st choice' : '2nd choice'} *
                      </label>
                      <CustomTimePicker
                        value={formData.time[index] || ''}
                        onChange={(time) => {
                          setFormData((prev) => {
                            const nextTime = [...prev.time];
                            nextTime[index] = time;
                            return { ...prev, time: nextTime };
                          });
                          setFormError((prev) => ({ ...prev, time: '' }));
                        }}
                        placeholder={`Select ${index === 0 ? '1st' : '2nd'} choice`}
                        error={!!formError.time}
                        helperText={index === 1 ? formError.time : undefined}
                      />
                    </div>
                  ))}
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
                    setFormData(prev => ({
                      ...prev,
                      format,
                      location:
                        format === VIDEO_INTERVIEW_FORMAT
                          ? VIDEO_INTERVIEW_LINK
                          : prev.location === VIDEO_INTERVIEW_LINK
                            ? ''
                            : prev.location,
                    }));
                    setFormError(prev => ({ ...prev, format: '', location: '' }));
                  }}
                  error={!!formError.format}
                  helperText={formError.format}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  {formData.format === VIDEO_INTERVIEW_FORMAT ? 'Video Link' : 'Interview Address'} *
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
