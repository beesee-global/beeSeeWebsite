import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DisclaimerProps {
    open: boolean
    onClose: () => void;
}

const  Disclaimer: React.FC<DisclaimerProps> = ({
    open,
    onClose,
}) => { 
  const handleClose = () => {
    onClose()
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
          <DialogContentText
            id="alert-dialog-description"
            sx={{ whiteSpace: "pre-line" }}
          >
          {`
          In compliance with the Data Privacy Act of 2012 (RA 10173), we protect your personal information and use it only for legitimate business and administrative purposes.

          Your data is kept confidential, accessed only by authorized personnel, and secured using appropriate technical and organizational measures. We do not share or sell your information without consent, unless required by law. Data is processed lawfully, retained only as necessary, and you will be notified of any data breach in accordance with NPC guidelines.

          By proceeding, you agree to the collection and processing of your personal data in accordance with RA 10173.
          `}

          </DialogContentText>
        </DialogContent>

        <DialogActions> 
          <Button onClick={handleClose} >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default Disclaimer