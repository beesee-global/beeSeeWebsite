import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';

interface DisclaimerProps {
  open: boolean;
  onCancel: () => void;   // called when user cancels
  onProceed: () => void;  // called when user confirms
}

const Disclaimer: React.FC<DisclaimerProps> = ({ open, onCancel, onProceed }) => {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      aria-labelledby="disclaimer-dialog-title"
      aria-describedby="disclaimer-dialog-description"
      disableEscapeKeyDown  // prevent closing with ESC
      disableBackdropClick   // prevent closing by clicking outside
    >
      <DialogTitle id="disclaimer-dialog-title" sx={{ color: 'black' }}>
        Data Privacy Act of 2012 (RA 10173)
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="disclaimer-dialog-description">
          By proceeding and submitting your information, you voluntarily consent
          to the collection, use, and processing of your personal data in
          accordance with the Data Privacy Act of 2012 (RA 10173). You acknowledge
          that any data you choose to provide is shared at your own discretion.
          For more details, please review our{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </Link>.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onProceed} variant="contained" color="primary" autoFocus>
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Disclaimer;
