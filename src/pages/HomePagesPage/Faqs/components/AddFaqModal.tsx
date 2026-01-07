import React, { useState } from "react";
import CustomTextField from "../../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../../components/Fields/CustomSelectField";
import { AlertColor } from '@mui/material/Alert'; 
import { useMutation } from '@tanstack/react-query' 
import { createFaqs } from '../../../../services/Ecommerce/faqsServices'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button, 
  IconButton,
} from "@mui/material";
import { HelpOutline, Close } from "@mui/icons-material";

interface AddFaqModalProps {
  open: boolean;
  onClose: () => void;
  onShowSnackbar: (type: AlertColor, msg: string) => void;
}

interface AddFaqModalFormData {
  title: string,
  device: string,
  category: string,
}

interface FormError {
  title?: string,
  device?: string,
  category?: string,
}

const categoryOptions = [
  { label: "Connectivity", value: "connectivity" },
  { label: "System", value: "system" },
  { label: "Performance", value: "performance" },
  { label: "General", value: "general" },
];

const devices = [
  { label: "Smartwatch", value: "smartwatch" },
  { label: "Laptop", value: "laptop" },
  { label: "Tablet", value: "tablet" },
  { label: "Educational TV", value: "educational_tv" },
  { label: "Data Server", value: "data_server" },
];

const AddFaqModal: React.FC<AddFaqModalProps> = ({ open, onClose, onShowSnackbar }) => {
  const [formError, setFormError] = useState<FormError>({}) 

  const validateForm = (): FormError => {
    const errors: FormError = {}

    if (!formData.title.trim()) errors.title = "Message is required."
    if (!formData.category.trim()) errors.category = "Category is required."
    if (!formData.device.trim()) errors.device = 'Device is required.'

     return errors
  }
  
  const [formData, setFormData] = useState<AddFaqModalFormData> ({
    title: "",
    device: "",
    category: "",
  });

  const mutation = useMutation({
    mutationFn: createFaqs,
    onSuccess: () => {
      onShowSnackbar("success", "Your question has been successfully submitted.");
      handleClose();
    },
    onError: () => {
      onShowSnackbar("error", "Failed to submit your question. Please try again.");
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
      const errors = validateForm();
      setFormError(errors)

      if (Object.keys(errors).length === 0) { 
        mutation.mutate(formData);
      }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // update form data
    setFormData((prev) => ({
      ...prev, 
      [name] : value
    }))

    setFormError((prev) => ({
      ...prev,
      [name] : undefined
    }))
  }

  const handleClose = () => {
    setFormError({})
    setFormData({
      title: "",
      device: "",
      category: "",
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"> 
      <DialogTitle className="font-bold">
        Add Your Question
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="flex flex-col gap-3">
        
        {/* Devices */}
        <CustomSelectField 
          name="device"
          value={formData.device}
          options={devices}
          onChange={handleInputChange}
          placeholder="Select a Device" 
          error={!!formError.device}
          helperText={formError.device}
        />

        {/* Category */}
        <CustomSelectField 
          name="category"
          value={formData.category}
          options={categoryOptions}
          onChange={handleInputChange}
          placeholder="Select a Category" 
          error={!!formError.category}
          helperText={formError.category}
        />

        {/* Question */}
        <CustomTextField 
          name="title"
          placeholder="Enter your question..."
          value={formData.title}
          type="text"
          onChange={handleInputChange}
          multiline={true}
          rows={4}
          maxLength={2500}
          icon={<HelpOutline />}
          error={!!formError.title}
          helperText={formError.title}
        />

      </DialogContent>

      <DialogActions
        className="p-5"
      >
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mutation.isPending}
          sx={{
            background: "linear-gradient(to right, #FCD000, #FFD700)",
            color: "#000",
            fontWeight: "bold",
            "&:hover": { opacity: 0.9 },
          }}
        >
          {mutation.isPending ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFaqModal;
