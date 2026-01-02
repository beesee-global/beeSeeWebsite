import React, { useState } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, AlertColor } from '@mui/material';

import { Email, Person, Close } from '@mui/icons-material';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomDateOfBirth from '../../../../components/Fields/CustomDateField';
import CustomPhoneField from '../../../../components/Fields/CustomPhoneField';

interface InquirerModalProps { 
    open: boolean;
    onShowSnackbar: (type: AlertColor, msg: string) => void;
    onClose: () => void;
}

interface InquirerModalFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: {
        phone_number: string;
        country_code: string;
        country_name: string;
    };
    date_of_birth: string;
}

interface PhoneValue {
    phone_number: string;
    country_code: string;
    country_name: string;
}

interface FormError {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
}

const InquirerModal: React.FC<InquirerModalProps> = ({ open, onClose, onShowSnackbar }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [formError, setFormError] = useState<FormError>({});

    const [formInquirerData, setFormInquirerData] = useState<InquirerModalFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: {
            phone_number: '',
            country_code: '',
            country_name: '',
        },
        date_of_birth: '',
    });

    const validateForm = (): FormError => {
        const errors: FormError = {};
        if (!formInquirerData.first_name.trim()) errors.first_name = 'First name is required.';
        if (!formInquirerData.last_name.trim()) errors.last_name = 'Last name is required.';
        if (!formInquirerData.email.trim()) errors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(formInquirerData.email)) errors.email = 'Invalid email format.';
        if (!formInquirerData.phone.phone_number.trim()) errors.phone = 'Phone number is required.';
        if (!formInquirerData.date_of_birth.trim()) errors.date_of_birth = 'Date of birth is required.';
        return errors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setLoading(true);

            const errors = validateForm();
            setFormError(errors);

            if (Object.keys(errors).length === 0) {
                handleClose();
                onShowSnackbar('success', 'Your inquire has been successfull submitted.');
                console.log('Form data: ', formInquirerData);

                /* Sending api to backend */
                // await
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormInquirerData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFormError((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    };

    const handlePhoneChange = (e: { target: { name: string; value: PhoneValue } }) => {
        const { value } = e.target;
        setFormInquirerData((prev) => ({
            ...prev,
            phone: { ...value },
        }));
    };

    const handleClose = () => {
        setFormError({});
        setFormInquirerData({
            first_name: '',
            last_name: '',
            email: '',
            phone: {
                phone_number: '',
                country_code: '',
                country_name: '',
            },
            date_of_birth: '',
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle className="font-bold">
                Schedule Consultation
                <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers className="flex flex-col gap-4">
                {/* first name */}
                <CustomTextField
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formInquirerData.first_name}
                    type="text"
                    onChange={handleInputChange}
                    multiline={false}
                    rows={1}
                    maxLength={2500}
                    icon={<Person />}
                    error={!!formError.first_name}
                    helperText={formError.first_name}
                />

                {/* last name */}
                <CustomTextField
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formInquirerData.last_name}
                    type="text"
                    onChange={handleInputChange}
                    multiline={false}
                    rows={1}
                    maxLength={2500}
                    icon={<Person />}
                    error={!!formError.last_name}
                    helperText={formError.last_name}
                />

                {/* email */}
                <CustomTextField
                    name="email"
                    placeholder="Enter your email"
                    value={formInquirerData.email}
                    type="text"
                    onChange={handleInputChange}
                    multiline={false}
                    rows={1}
                    maxLength={2500}
                    icon={<Email />}
                    error={!!formError.email}
                    helperText={formError.email}
                />

                

                <div className='mt-3 mb-3 flex flex-col gap-8'>
                    {/* Phone */}
                    <CustomPhoneField
                        key={formInquirerData.phone.country_code}
                        name="phone"
                        value={formInquirerData.phone}
                        onChange={handlePhoneChange}
                        placeholder="Phone"
                        icon={<LocalPhoneIcon />}
                        type="tel"
                        error={!!formError.phone}
                        helperText={formError.phone}
                    />

                    {/* Date of birth */}    
                    <CustomDateOfBirth
                        name="date_of_birth"
                        value={formInquirerData.date_of_birth}
                        onChange={handleInputChange}
                        label="Date" 
                        error={!!formError.date_of_birth}
                        helperText={formError.date_of_birth}
                    /> 
                </div>

            </DialogContent>

            <DialogActions className="p-5">
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
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

export default InquirerModal;
