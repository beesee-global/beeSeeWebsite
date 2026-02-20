  import React, { useState, useEffect } from 'react';
  import Button from '@mui/material/Button';
  import Dialog from '@mui/material/Dialog';
  import DialogActions from '@mui/material/DialogActions';
  import DialogContentText from '@mui/material/DialogContentText';
  import DialogTitle from '@mui/material/DialogTitle';
  import CustomTextField from '../../../../components/Fields/CustomTextField';
  import CustomSelectField from '../../../../components/Fields/CustomSelectField';
  import { styled } from '@mui/material/styles';
  import DialogContent from '@mui/material/DialogContent';
  import CloseIcon from '@mui/icons-material/Close';
  import IconButton from '@mui/material/IconButton';
  import RichTextEditor from '../../../../components/Fields/RichTextEditor';

  interface FieldConfig {
    name: string;
    placeholder: string;
    type: string; // "text" | "select"
    value: string;
    maxLength?: number;
    multiline?: boolean;
    rows?: number;
    options?: { value: string; label: string; categories_id?: string; is_active?: string | boolean }[];
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
    '& .MuiDialog-paper': { width: '800px', maxWidth: '95%' },
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
  }));

  const FaqsDialog: React.FC<ReusableModalProps> = ({
    open,
    onClose,
    title,
    description,
    fields,
    onSubmit,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel'
  }) => {
    // Initialize formData
    const initialForm: Record<string, string> = {};
    fields.forEach(field => initialForm[field.name] = field.value || '');
    if (!initialForm['explanation']) initialForm['explanation'] = '';

    const [formData, setFormData] = useState(initialForm);
    const [formError, setFormError] = useState<Record<string, string>>({});
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isAllDevices, setIsAllDevices] = useState<boolean>(false);

    useEffect(() => {
      const newForm: Record<string, string> = {};
      fields.forEach(field => {
        newForm[field.name] = field.value || "";
      });
      if (!newForm['explanation']) newForm['explanation'] = '';
      setFormData(newForm); 
      setSelectedCategory(newForm["category"] || "");
      setIsAllDevices(newForm["product"] === "");
    }, [fields, open]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormError(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormError(prev => ({ ...prev, [name]: '' }));

      // Reset product if category changes
      if (name === "category") {
        setSelectedCategory(value);
        setFormData(prev => ({ ...prev, product: "" }));
        setIsAllDevices(false);
      }
    };

    const handleAllDevicesToggle = (checked: boolean) => {
      setIsAllDevices(checked);
      setFormData(prev => ({
        ...prev, 
        is_all_devices: checked ? "1" : "0"
      }));
      setFormError(prev => ({ ...prev, product: '' }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const errors: Record<string, string> = {};
      const categoryField = fields.find(f => f.name === "category");
      const selectedCategoryOption = categoryField?.options?.find(
        option => String(option.value) === String(selectedCategory)
      );
      const isCategoryActive = selectedCategoryOption?.is_active === true || selectedCategoryOption?.is_active === 'true';

      // Validate RichTextEditor (explanation)
      if (!formData.explanation || formData.explanation === '<p></p>') {
        errors.explanation = "Explanation is required";
      }

      // Validate other fields
      fields.forEach(field => {
        if (field.name === "product" && (isAllDevices || isCategoryActive)) return;
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
      setFormData(initialForm);
    };

    return (
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          onClose();
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, color: '#000' }}>{title}</DialogTitle>
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
          <form onSubmit={handleSubmit} id="reusable-form" className="space-y-4">
            
          {/* Other fields */}
          {fields
            .filter(f => f.name !== 'explanation') // exclude explanation field
            .map(field => {
              const categoryField = fields.find(f => f.name === "category");
              const selectedCategoryOption = categoryField?.options?.find(
                option => String(option.value) === String(selectedCategory)
              );
              const isCategoryActive = selectedCategoryOption?.is_active === true || selectedCategoryOption?.is_active === 'true';
              const shouldHideProduct = !selectedCategory || isCategoryActive || isAllDevices;

              // Hide the product dropdown if no category is selected
              // or the category is marked active, or "all devices" is checked.
              if (field.name === "product" && shouldHideProduct) {
                return null; // skip rendering
              }

              if (field.type === "select") {
                // Filter product options based on selected category
                const options =
                  field.name === "product" && field.options
                    ? [
                        ...field.options.filter(
                          p => p.categories_id?.toString() === selectedCategory
                        ),
                        ...field.options.filter(p => p.value === ''), // always include Others
                      ]
                    : field.options || [];

                return (
                  <div key={field.name} className="space-y-2">
                    <CustomSelectField
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={(e: any) => handleSelectChange(field.name, e.target.value)}
                      options={options}
                      error={!!formError[field.name]}
                      helperText={formError[field.name]}
                    />
                    {field.name === "product" && selectedCategory && !isCategoryActive && (
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={isAllDevices}
                          onChange={(e) => handleAllDevicesToggle(e.target.checked)}
                        />
                        Applicable to all devices
                      </label>
                    )}
                  </div>
                );
              }

              return (
                <CustomTextField
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleTextChange}
                  multiline={field.multiline}
                  rows={field.rows}
                  maxLength={field.maxLength}
                  error={!!formError[field.name]}
                  helperText={formError[field.name]}
                />
              );
            })}


              {/* RichTextEditor for explanation */}
              <div>
                <label className="block font-semibold mb-1">Explanation</label>
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{cancelLabel}</Button>
          <Button type="submit" form="reusable-form">{submitLabel}</Button>
        </DialogActions>
      </BootstrapDialog>
    );
  };

  export default FaqsDialog;
