import Alert, { AlertColor } from "@mui/material/Alert";
import MuiSnackbar from "@mui/material/Snackbar";
import { useEffect } from "react";

interface SnackbarProps {
    open: boolean;
    type: AlertColor // "success" | "info" | "warning" | "error"
    message: string; 
    onClose?: () => void;
}

const Snackbar: React.FC <SnackbarProps> = ({
    open,
    type,
    message, 
    onClose,
}) => { 

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                handleClose()
            }, 4000);

            return () => clearTimeout(timer)
        }
    },[open])
    
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return
        if (onClose) onClose();
    }

    return (
        <MuiSnackbar
            open={open}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: "center"
            }}
            sx={{
                marginTop: '80px',
            }}
        >
            <Alert
                onClose={handleClose}
                severity={type}
                variant="filled"
                sx={{ 
                    width: "100%",
                    maxWidth: '400px',
                    zIndex: 9999,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    fontSize: '16px',
                    // Make it more visible
                    '& .MuiAlert-message': {
                        fontWeight: 500
                    }
                }}
            >
                {message}
            </Alert>
        </MuiSnackbar>
    )
}

export default Snackbar;