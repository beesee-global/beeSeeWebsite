import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean; // 👈 new prop
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onSubmit,
  isLoading = false, // default false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) onSubmit(); // prevent double submit
  };

  const handleClose = () => {
    if (!isLoading) onClose(); // prevent closing while deleting
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="font-bold" sx={{ color: 'black' }}>{title}</DialogTitle>

      <DialogContent dividers className="flex flex-col gap-4">
        {message}
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

export default AlertDialog;
