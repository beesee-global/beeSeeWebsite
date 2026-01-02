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
        >
        <Alert
            onClose={handleClose}
            severity={type}
            variant="filled"
            sx={{ width: "100%"}}
        >
            {message}
        </Alert>
    </MuiSnackbar  >
    )
}

export default Snackbar
