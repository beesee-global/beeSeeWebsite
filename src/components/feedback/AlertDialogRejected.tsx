import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import CustomTextField from '../Fields/CustomTextField';

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
}) => {
  const [remarks, setRemarks] = useState<string>(initialRemarks);
  const [remarksError, setRemarksError] = useState(false);

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
            <CustomTextField
              name="remarks"
              placeholder={remarksPlaceholder}
              value={remarks}
              onChange={(e) => {
                setRemarksError(false);
                setRemarks(String(e.target.value));
              }}
              disabled={isLoading}
              rows={3}
              multiline={true}
              type="text"
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
