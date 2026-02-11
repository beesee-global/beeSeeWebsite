import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions'; 
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CustomTextField from '../Fields/CustomTextField';
import { styled } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useEffect } from 'react';
import CustomSelectField from '../Fields/CustomSelectField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';

interface FieldConfig {
  name: string;
  placeholder: string;
  type: string;            // "text" | "select" | "checkbox"
  value: string;

  // Make optional for select fields
  maxLength?: string;
  multiline?: boolean;
  rows?: number;

  label?: string;
  options?: { value: string; label: string }[];
  validator?: (value: string) => string | undefined;
}

interface ReusableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  onSubmit: (formData: Record<string, string>) => void;
  submitLabel?: string;
  cancelLabel?: string;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {      // target the actual dialog box
    width: '500px',            // fixed width
    maxWidth: '90%',           // responsive max width
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const ReusableTextFieldModal: React.FC<ReusableModalProps> = ({
  open,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel'
}) => {
  const initialForm: Record<string, string> = {};
  fields.forEach(field => {
    initialForm[field.name] = field.value ?? (field.type === "checkbox" ? "false" : "");
  });

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState<Record<string, string>>({});

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(prev => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked ? "true" : "false" }));
    setFormError(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.validator) {
        const error = field.validator(formData[field.name]);
        if (error) errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    onSubmit(formData);
    onClose();
    // Reset form after submit
    setFormData(initialForm);
  };

  useEffect(() => {
    const newForm: Record<string, string> = {};
    fields.forEach(field => {
      newForm[field.name] = field.value ?? (field.type === "checkbox" ? "false" : "");
    });

    setFormData(newForm);
  }, [fields, open]);


  return (
    <BootstrapDialog 
      aria-labelledby="customized-dialog-title" 
      open={open} 
      onClose={onClose}
      >
      <DialogTitle  sx={{ m: 0, p: 2,  color: 'black' }} >
        {title}
      </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      <DialogContent dividers>
        {description && <DialogContentText>{description}</DialogContentText>}
        <form onSubmit={handleSubmit} id="reusable-form">
          {fields.map(field => (
            field.type === "checkbox" ? (
              <FormControl key={field.name} error={!!formError[field.name]} sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name={field.name}
                      checked={formData[field.name] === "true"}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={field.label ?? field.placeholder}
                />
                {!!formError[field.name] && (
                  <FormHelperText>{formError[field.name]}</FormHelperText>
                )}
              </FormControl>
            ) : field.type === "select" ? (
              <CustomSelectField
                key={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChangeInput}
                options={field.options || []}
                error={!!formError[field.name]}
                helperText={formError[field.name]}
              />
            ) : (
              <CustomTextField
                key={field.name}
                name={field.name}
                placeholder={field.placeholder}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChangeInput}
                multiline={field.multiline}
                rows={field.rows}
                maxLength={field.maxLength}
                error={!!formError[field.name]}
                helperText={formError[field.name]}
              />
            )
          ))}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button type="submit" form="reusable-form">{submitLabel}</Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ReusableTextFieldModal;
