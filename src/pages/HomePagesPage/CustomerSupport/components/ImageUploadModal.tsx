import NoImage from '../../../../../public/noImage.jpeg';
import React, { useRef, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface AddImageUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File | null, base64?: string) => void;
    accept?: string;
    title?: string;
    helperText?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUploadModal: React.FC<AddImageUploadModalProps> = ({
    open,
    onClose,
    onSubmit,
    accept = 'image/*',
    title = 'Image Upload',
    helperText = '* Please ensure your file is smaller than 10 MB.',
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const convertToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
        });

    const resetState = () => {
        setSelectedFile(null);
        setPreview(null);
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (!file) {
            resetState();
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 10 MB.');
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            onClose();
            return;
        }

        try {
            const shouldConvertToBase64 = selectedFile.type.startsWith('image/');
            const base64 = shouldConvertToBase64
                ? await convertToBase64(selectedFile)
                : undefined;

            onSubmit(selectedFile, base64);
            resetState();
        } catch (err) {
            console.error('Base64 conversion failed', err);
            resetState();
        }

        onClose();
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const isVideoFile = selectedFile?.type.startsWith('video/');

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle className="font-bold flex justify-between items-center">
                {title}
                <IconButton onClick={handleClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent className="flex flex-col gap-4">
                <input
                    type="file"
                    accept={accept}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex flex-col gap-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#FCD000] transition"
                    >
                        {preview && isVideoFile ? (
                            <video
                                src={preview}
                                controls
                                className="w-full h-70 object-cover rounded-md shadow-md bg-black"
                            />
                        ) : (
                            <img
                                src={preview || NoImage}
                                alt="Preview"
                                className="w-full h-70 object-cover rounded-md shadow-md"
                            />
                        )}
                    </div>

                    <p className="text-sm text-gray-500">{helperText}</p>
                    {selectedFile && (
                        <p className="text-sm text-gray-600 break-all">
                            {selectedFile.name}
                        </p>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
            </DialogContent>

            <DialogActions className="p-4">
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!selectedFile}
                    sx={{
                        background: 'linear-gradient(to right, #FCD000, #FFD700)',
                        color: '#000',
                        fontWeight: 'bold',
                        '&:hover': { opacity: 0.9 },
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageUploadModal;
