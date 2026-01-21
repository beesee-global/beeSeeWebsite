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
import { Send, MapPin, Clock, Calendar } from 'lucide-react';

interface ApplicantsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: { 
    location: string;
    time: string;
    date: string;
    schedule: string;
  }) => void;
  applicantName?: string;
  applicantEmail?: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': { width: '700px', maxWidth: '95%' },
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
    schedule: ''
  });

  const [formError, setFormError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({ 
        location: '',
        time: '',
        date: '',
        schedule: ''
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
      errors.schedule = "Schedule is required";
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
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <div>Send Interview Invitation</div>
            {applicantName && (
              <div className="text-sm font-normal text-gray-600">
                To: {applicantName} ({applicantEmail})
              </div>
            )}
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

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Location *
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

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
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
              icon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Time *
            </label>
            <CustomTextField
              name="time"
              placeholder="Enter interview time"
              value={formData.time}
              onChange={handleTextChange}
              multiline={false}
              rows={1}
              type="time"
              error={!!formError.time}
              helperText={formError.time}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Schedule Details *
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
          Send Invitation
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ApplicantsDialog;