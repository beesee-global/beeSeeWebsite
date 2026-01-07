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
In compliance with the Data Privacy Act of 2012 (RA 10173), we are committed to protecting any personal information you provide. All data collected through this system will be used solely for legitimate business, verification, and administrative purposes.

We ensure that:
• Your personal information is kept strictly confidential and accessed only by authorized personnel.
• No data will be shared, sold, or disclosed to third parties without your explicit consent, unless required by law, court order, or government regulation.
• Appropriate organizational, physical, and technical security measures are implemented to safeguard your information from unauthorized access, alteration, disclosure, or loss.
• Your data will be processed fairly and lawfully in accordance with the Data Privacy Act of 2012 (RA 10173).
• You will be notified in case of any data breach that may compromise your rights or privacy, following NPC guidelines.
• Your information will only be retained for as long as necessary to fulfill its intended purpose or to comply with legal requirements.

By proceeding, you acknowledge that you understand and agree to the collection and processing of your personal data in accordance with RA 10173.
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