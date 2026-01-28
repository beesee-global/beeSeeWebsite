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
import CustomDuration from '../../../../components/Fields/CustomDuration';
import CustomFormat from '../../../../components/Fields/CustomFormat';

interface ApplicantsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { 
    location: string;
    time: string;
    date: string;
    schedule: string;
    duration: string;
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
    time: '',
    date: '',
    schedule: '',
    duration: '',
    format: ''
  });

  const [formError, setFormError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({ 
        location: '',
        time: '',
        date: '',
        schedule: '',
        duration: '',
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

  const validateForm = () => {
    const errors: Record<string, string> = {}; 
    
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    
    if (!formData.time.trim()) {
      errors.time = "Time is required";
    }
    
    if (!formData.date.trim()) {
      errors.date = "Date is required";
    }
    
    if (!formData.schedule.trim()) {
      errors.schedule = "Message is required";
    }

    if (!formData.format.trim()) {
      errors.format = "Format is required";
    }

    if (!formData.duration.trim()) {
      errors.duration = "Duration is required";
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
                  Start Time *
                </label>
                <CustomTimePicker 
                  value={formData.time}
                  onChange={(time) => {
                    setFormData(prev => ({ ...prev, time }));
                    setFormError(prev => ({ ...prev, time: '' }));
                  }}
                  placeholder="Select start time"
                  error={!!formError.time}
                  helperText={formError.time}
                />
              </div>

              {/* duration */}
              <div>
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
              </div>
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