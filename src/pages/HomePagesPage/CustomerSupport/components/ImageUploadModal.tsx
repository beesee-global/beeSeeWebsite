import NoImage from '../../../../../public/noImage.jpeg';
import React, { useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface AddImageUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File | null, base64?: string) => void; // 👈 now returns file + optional base64
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUploadModal: React.FC<AddImageUploadModalProps> = ({ open, onClose, onSubmit }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setError("File size must be less than 5MB.");
                setSelectedFile(null);
                setPreview(null);
                return;
            }

            setError(null);
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async () => {
        if (selectedFile) {
            try {
                const base64 = await convertToBase64(selectedFile);
                onSubmit(selectedFile, base64); // 👈 return both file and base64
                setSelectedFile(null)
                setPreview(null);
            } catch (err) {
                console.error("Base64 conversion failed", err);
                setSelectedFile(null)
                setPreview(null);
            }
        }
        onClose();
    };

    const handleClose = () => {
        setPreview(null);
        setError(null);
        setSelectedFile(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle className="font-bold flex justify-between items-center">
                Image Upload
                <IconButton onClick={handleClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent className="flex flex-col gap-4">
                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Upload Area */}
                <div className="flex flex-col gap-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex flex-col items-center justify-center
                            border-2 border-dashed border-gray-300 rounded-lg p-4 
                            hover:border-[#FCD000] transition"
                    >
                        <img
                            src={preview || NoImage}
                            alt="Preview"
                            className="w-full h-70 object-cover rounded-md shadow-md"
                        />
                    </div>

                    <p className="text-sm text-gray-500">* Please ensure your file is smaller than 5 MB.</p>
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
