import Alert, { AlertColor } from "@mui/material/Alert";
import MuiSnackbar from "@mui/material/Snackbar";
import { useEffect } from "react";

interface SnackbarProps {
    open: boolean;
    type: AlertColor // "success" | "info" | "warning" | "error"
    message: string; 
    onClose?: () => void;
}

const SnackbarTechnician: React.FC <SnackbarProps> = ({
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
                zIndex: 9999,
                top: { xs: "16px", sm: "105px" },
                left: "50%",
                right: "auto",
                bottom: "auto",
                transform: "translateX(-50%)",
            }}
        >
            <Alert
                onClose={handleClose}
                severity={type}
                variant="filled"
                sx={{ 
                    width: { xs: "calc(100vw - 16px)", sm: "100%" },
                    maxWidth: { xs: "calc(100vw - 16px)", sm: "420px" },
                    mx: "auto",
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    fontSize: { xs: '14px', sm: '16px' },
                    borderRadius: { xs: '10px', sm: '12px' },
                    '& .MuiAlert-message': {
                        fontWeight: 500,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                    }
                }}
            >
                {message}
            </Alert>
        </MuiSnackbar>
    )
}

export default SnackbarTechnician;
