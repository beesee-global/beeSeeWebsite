import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../../components/Fields/CustomSelectField';
import { fetchProducts, fetchProductAll } from '../../../../services/Technician/issuesServices';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions'; 
import DialogContent from '@mui/material/DialogContent'; 
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface FormError {
  id?: string; 
  categories_id?: string;
  name?: string;
}

interface FormData {
  id?: string; 
  categories_id: string;
  name: string;
}

interface IssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: FormData;
  onSave: (formData: FormData) => void;
  isEditMode: boolean;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '500px',
    maxWidth: '90%',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const IssuesModal: React.FC<IssuesModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  onSave,
  isEditMode
}) => {
  const initialState: FormData = {
    id: '', 
    name: '',
    categories_id: '',
  };

  const [formData, setFormData] = useState<FormData>(initialState);
  const [formError, setFormError] = useState<FormError>({}); 

  // Load categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchProductAll,
    select: (res) =>
      res?.data?.map((item: any) => ({ 
        value: item.id,
        label: item.product_name 
    })) ?? [],
  });

  // Load products based on selected category
  const { data: productsResponse } = useQuery({
    queryKey: ['products', formData?.categories_id],
    queryFn: () => fetchProducts(Number(formData?.categories_id)),
    enabled: !!formData?.categories_id,
    select: (res) =>
      res?.data?.map((item: any) => ({ 
        value: item.id, 
        label: item.product_name })) ?? [],
  });

  // Populate form if editing
  useEffect(() => {
    if (isOpen && selectedProduct) { 
      setFormData({
        id: selectedProduct.id, 
        name: selectedProduct.name,
        categories_id: selectedProduct.categories_id,
      });
    }
  }, [isOpen, selectedProduct]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) setFormData(initialState);
  }, [isOpen]);

  useEffect(() => {
    if (!isEditMode) setFormData(initialState)
  }, [isEditMode])
/* 
    useEffect(() => {
        if (prevCategory && prevCategory !== formData?.categories_id) {
            setFormData((prev) => ({ ...prev, products_id: '' }));
        }
        setPrevCategory(formData?.categories_id);
    }, [formData?.categories_id]); */

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors: FormError = {};
    if (!formData?.categories_id) errors.categories_id = 'Device is required.';
    if (!formData?.name) errors.name = 'Issue is required.';

    setFormError(errors);

    if (Object.keys(errors).length === 0) {
      onSave(formData);
      setFormData(initialState);
    }
  };

  if (!isOpen) return null;

  return (
    <BootstrapDialog 
        open={isOpen} 
        onClose={() => {onClose(); setFormData(initialState);}} 
        aria-labelledby="issue-dialog-title"
    >
      <DialogTitle sx={{ m: 0, p: 2, color: 'black' }} id="issue-dialog-title">
        {isEditMode ? 'Edit Issue Type' : 'Issue Type Details'}
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
        <form onSubmit={handleSubmit} id="reusable-form">
          <CustomSelectField
            name="categories_id"
            value={formData?.categories_id}
            options={categories ?? []}
            onChange={handleChangeInput}
            placeholder="Select a Device Type"
            error={!!formError?.categories_id}
            helperText={formError?.categories_id}
          /> 

          <CustomTextField
            name="name"
            value={formData?.name}
            onChange={handleChangeInput}
            placeholder="Issue Type"
            type="text"
            multiline={false}
            rows={1}
            maxLength={100}
            error={!!formError?.name}
            helperText={formError?.name}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button type="submit" onClick={handleSubmit}>
          {isEditMode ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default IssuesModal;
