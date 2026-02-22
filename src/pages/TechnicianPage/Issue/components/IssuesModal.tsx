import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import CustomSelectField from '../../../../components/Fields/CustomSelectField';
import { fetchProducts, fetchProductAll, fetchCategory } from '../../../../services/Technician/issuesServices';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions'; 
import DialogContent from '@mui/material/DialogContent'; 
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import RichTextEditor from '../../../../components/Fields/RichTextEditor';
import { userAuth } from '../../../../hooks/userAuth';
interface FormError {
  id?: string; 
  product_id?: string;
  categories_id?:string;
  name?: string;
  explanation?: string;
}

interface FormData {
  id?: string; 
  product_id: string;
  categories_id: string;
  name: string;
  explanation?: string;
  publish?: boolean;
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
    product_id: '', 
    categories_id: "",
    explanation: '',
    publish: false,
  };

  const [formData, setFormData] = useState<FormData>(initialState);
  const [formError, setFormError] = useState<FormError>({}); 
  const queryClient = useQueryClient()
  const {
    setSnackBarMessage,
    setSnackBarType,
    setSnackBarOpen
  } = userAuth()

  // Load model
  const { data: deviceType } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategory,
    select: (res) =>
      res?.data?.map((item: any) => ({ 
        value: String(item.id),
        label: item.name 
    })) ?? [],
  });

  // Load products based on selected category
  const { data: modelType, isLoading } = useQuery({
    queryKey: ['products', formData?.categories_id],
    queryFn: () => fetchProducts(Number(formData?.categories_id)),
    enabled: !!formData?.categories_id,
    select: (res) =>
      res?.data?.map((item: any) => ({ 
        value: String(item.id), 
        label: item.product_name })) ?? [],
  });

  // Populate form if editing
  useEffect(() => {
    if (isOpen && selectedProduct) { 
      setFormData({
        id: selectedProduct.id, 
        name: selectedProduct.name,
        categories_id: String((selectedProduct as any).categories_id ?? ''),
        product_id: String((selectedProduct as any).product_id ?? ''),
        explanation: (selectedProduct as any).possible_solutions ?? '',
        publish: !!(selectedProduct as any).is_publish
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

  const prevCategoryRef = React.useRef<string>('');

  useEffect(() => { 
    const prevCategory = prevCategoryRef.current;
    const nextCategory = String(formData?.categories_id ?? '');

    // Only clear product when user actually changes category (not when pre-filling on edit).
    if (prevCategory && prevCategory !== nextCategory) {
      setFormData((prev) => ({ ...prev, product_id: '' }));
    }

    prevCategoryRef.current = nextCategory;
    queryClient.refetchQueries({ queryKey: ['products'] });
  }, [formData?.categories_id, queryClient]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFormError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors: FormError = {};
    if (!formData?.product_id) errors.product_id = 'Model type is required.';
    if (!formData?.categories_id) errors.categories_id ="Device type is required."
    if (!formData?.explanation) errors.explanation = "Possible solution is required."
    if (!formData?.name) errors.name = 'Issue is required.';

    setFormError(errors);
    setSnackBarMessage("Please fill the required fields.")
    setSnackBarType("error")
    setSnackBarOpen(true)

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
        <form onSubmit={handleSubmit} id="reusable-form" className='space-y-2'>
          <CustomSelectField
            name="categories_id"
            value={formData?.categories_id}
            options={deviceType ?? []}
            onChange={handleChangeInput}
            placeholder="Select a Device Type"
            error={!!formError?.categories_id}
            helperText={formError?.categories_id}
          /> 

          <CustomSelectField
            name="product_id"
            value={formData?.product_id}
            options={modelType ?? []}
            onChange={handleChangeInput}
            placeholder="Select a Model Type"
            error={!!formError?.product_id}
            helperText={formError?.product_id}
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

          {/* RichTextEditor for explanation */}
          <div>
            <label className="block font-semibold mb-1">
              Possible Solution
            </label>
            <RichTextEditor
              value={formData.explanation || ''}
              onChange={(value) =>
                setFormData(prev => ({ ...prev, explanation: value }))
              }
            />
            {formError.explanation && (
              <p className="text-red-500 text-sm mt-1">{formError.explanation}</p>
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="publish"
              name="publish"
              type="checkbox"
              checked={!!formData.publish}
              onChange={handleChangeInput}
            />
            <label htmlFor="publish">Publish</label>
          </div>
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
