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
  onClose: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ open, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Data Privacy Act of 2012 (RA 10173)"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
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
            </Link>.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Disclaimer;
