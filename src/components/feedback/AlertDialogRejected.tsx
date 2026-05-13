import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import CustomSelectField from '../Fields/CustomSelectField';
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
    queryKey: ['rejected'],
    queryFn: fetchAllRejectedNotes
  });

  const dataRejectedNotes = rejectedNotesResponse?.data || []
 
  const rejectedNoteOptions = useMemo(() => {
    return dataRejectedNotes.map((note: any) => ({
      value: note.message,
      label: note.message,
    }))
  }, [dataRejectedNotes])

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
            <label htmlFor="rejection-remarks">{remarksLabel}</label>
            <CustomSelectField
              name="remarks"
              placeholder={remarksPlaceholder}
              value={remarks}
              onChange={(e) => {
                setRemarksError(false);
                setRemarks(String(e.target.value));
              }}
              disabled={isLoading}
              freeSolo
              options={rejectedNoteOptions.length > 0 ? rejectedNoteOptions : commonRejectionOptions} 
              maxLength={250}
              error={remarksError}
              helperText={remarksError ? 'Remarks is required.' : ''}
            />
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
