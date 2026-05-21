import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import  { fetchAllRejectedNotes } from "../../services/Technician/rejectedNotedService"
  
const commonRejectionOptions = [
  { value: 'Does not meet the required qualifications', label: 'Does not meet the required qualifications' },
  { value: 'Experience does not match the role requirements', label: 'Experience does not match the role requirements' },
  { value: 'Skills do not match the position requirements', label: 'Skills do not match the position requirements' },
  { value: 'Application is incomplete or missing documents', label: 'Application is incomplete or missing documents' },
  { value: 'Unable to contact applicant', label: 'Unable to contact applicant' },
  { value: 'Salary expectations do not match the role', label: 'Salary expectations do not match the role' },
  { value: 'Position has already been filled', label: 'Position has already been filled' },
  { value: 'Not selected after interview evaluation', label: 'Not selected after interview evaluation' },
];


interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onSubmit: (remarks?: string) => void;
  isLoading?: boolean;
  showRemarks?: boolean;
  remarksLabel?: string;
  remarksPlaceholder?: string;
  remarksRequired?: boolean;
  initialRemarks?: string;
  remarksOptions?: { value: string; label: string }[];
}

const AlertDialogRejected: React.FC<AlertDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onSubmit,
  isLoading = false,
  showRemarks = false,
  remarksLabel = 'Remarks',
  remarksPlaceholder = 'Enter remarks',
  remarksRequired = false,
  initialRemarks = '',
  remarksOptions = commonRejectionOptions,
}) => {
  const [remarks, setRemarks] = useState<string>(initialRemarks);
  const [remarksError, setRemarksError] = useState(false);

  const { data: rejectedNotesResponse } = useQuery({
    queryKey: ['rejected-notes'],
    queryFn: fetchAllRejectedNotes,
    enabled: open && showRemarks,
  });

  const dataRejectedNotes = rejectedNotesResponse?.data?.data || rejectedNotesResponse?.data || []
 
  const rejectedNoteOptions = useMemo(() => {
    const apiOptions = Array.isArray(dataRejectedNotes)
      ? dataRejectedNotes.map((note: any) => String(note.message || '').trim()).filter(Boolean)
      : [];

    const fallbackOptions = (remarksOptions.length > 0 ? remarksOptions : commonRejectionOptions)
      .map((option) => String(option.label || option.value || '').trim())
      .filter(Boolean);

    return Array.from(new Set([...apiOptions, ...fallbackOptions]));
  }, [dataRejectedNotes, remarksOptions])

  useEffect(() => {
    if (!open) return;
    setRemarks(initialRemarks);
    setRemarksError(false);
  }, [open, initialRemarks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (showRemarks && remarksRequired && !remarks.trim()) {
      setRemarksError(true);
      return;
    }

    onSubmit(showRemarks ? remarks : undefined);
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-bold" sx={{ color: 'black' }}>
        {title}
      </DialogTitle>

      <DialogContent dividers className="flex flex-col gap-4">
        <div>{message}</div>

        {showRemarks && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {remarksLabel}
            </label>
            <Autocomplete
              freeSolo
              options={rejectedNoteOptions}
              inputValue={remarks}
              onInputChange={(_, value) => {
                setRemarksError(false);
                setRemarks(value.slice(0, 250));
              }}
              onChange={(_, value) => {
                setRemarksError(false);
                setRemarks(String(value || '').slice(0, 250));
              }}
              disabled={isLoading}
              noOptionsText="Type a custom rejection note"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={remarksPlaceholder}
                  size="small"
                  error={remarksError}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px',
                      '& fieldset': {
                        borderColor: remarksError ? 'red' : '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: remarksError ? 'red' : '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: remarksError ? 'red' : '#FCD000',
                      },
                    },
                  }}
                />
              )}
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className={remarksError ? 'text-red-500' : 'text-gray-500'}>
                {remarksError ? 'Remarks is required.' : 'Choose an option or type a custom note.'}
              </span>
              <span className="text-gray-400">{remarks.length}/250</span>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="p-5">
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            background: 'linear-gradient(to right, #FCD000, #FFD700)',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': { opacity: 0.9 },
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialogRejected;
