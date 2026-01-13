import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { Box, Button, Fade, Collapse } from "@mui/material";
import { Plus, Check, Shield, ChevronDown } from "lucide-react";

import CustomTextField from "../../../../components/Fields/CustomTextField";
import CustomSelectField from "../../../../components/Fields/CustomSelectField";

/* ================= TYPES ================= */

interface FieldConfig {
  name: string;
  placeholder: string;
  type: "text" | "select";
  value: string;
  maxLength?: string;
  multiline?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  validator?: (value: string) => string | undefined;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FieldConfig[];
  onSubmit: (formData: Record<string, any>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  initialPermissions?: string[];
  isPermissionLocked?: boolean;
}

/* ================= STYLES ================= */

const StyledTextField = styled("input")(({ error }: { error?: boolean }) => ({
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  fontFamily: "inherit",
  border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`,
  borderRadius: "12px",
  outline: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#fff",
  
  "&:focus": {
    borderColor: error ? "#ef4444" : "#6366f1",
    boxShadow: error 
      ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
      : "0 0 0 3px rgba(99, 102, 241, 0.1)",
  },
  
  "&:hover": {
    borderColor: error ? "#ef4444" : "#d1d5db",
  },
}));

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "520px",
    maxWidth: "90%",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

/* ================= PERMISSIONS ================= */

const permissionTree = [ 
  { id: "job-order", name: "Job Order", url: "/beesee/job-order" },
  { id: "users", name: "Users", url: "/beesee/users" },
  { id: "faqs", name: "Faqs", url: "/beesee/faqs" },
  { id: "inquiries", name: "Inquiries", url: "/beesee/inquiries" },
  { id: "careers", name: "Careers", url: "/beesee/careers" },
  {
    id: "settings",
    name: "Settings",
    children: [
      { id: "device", name: "Device Type", url: "/beesee/device" },
      { id: "model", name: "Model Type", url: "/beesee/model" },
      { id: "issue", name: "Issue Type", url: "/beesee/issue" },
      { id: "position", name: "Position", url: "/beesee/position" },
    ],
  },

];

/* ================= COMPONENT ================= */

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  initialPermissions = [],
  isPermissionLocked,
}) => {
  /* ---------- form ---------- */
  const initialForm: Record<string, string> = {};
  fields.forEach((f) => (initialForm[f.name] = f.value || ""));

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState<Record<string, string>>({});

  /* ---------- permissions ---------- */
  const [selectedButton, setSelectedButton] = useState<string[]>(initialPermissions);
  const [selectedButtonError, setSelectedButtonError] = useState("");
  const [expandedSettings, setExpandedSettings] = useState(false);

  /* ================= HANDLERS ================= */

  const handleChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggleParent = (id: string) => {
    if (id === "settings") {
      const isCurrentlySelected = selectedButton.includes("settings");
      setExpandedSettings(!isCurrentlySelected); // collapse/expand
      if (isCurrentlySelected) {
        // Reset child selections
        const settingsChildren = permissionTree.find(p => p.id === "settings")?.children?.map(c => c.id) || [];
        setSelectedButton(prev => prev.filter(p => p !== "settings" && !settingsChildren.includes(p)));
      } else {
        setSelectedButton(prev => [...prev, "settings"]);
      }
    } else {
      setSelectedButton(prev =>
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
    }
  };

  const handleToggleChild = (id: string) => {
    setSelectedButton((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

    // auto-enable settings if child selected
    setSelectedButton((prev) =>
      prev.includes("settings") ? prev : [...prev, "settings"]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.validator) {
        const err = field.validator(formData[field.name]);
        if (err) errors[field.name] = err;
      }
    });

    if (selectedButton.length === 0) {
      setSelectedButtonError("Please select at least one permission");
    } else {
      setSelectedButtonError("");
    }

    if (Object.keys(errors).length > 0 || selectedButton.length === 0) {
      setFormError(errors);
      return;
    }

    onSubmit({
      ...formData,
      permissions: selectedButton,
    });

    onClose();
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    const newForm: Record<string, string> = {};
    fields.forEach((f) => (newForm[f.name] = f.value || ""));
    setFormData(newForm);
    setSelectedButton(initialPermissions);
    setExpandedSettings(initialPermissions.includes("settings"));
  }, [open, fields]);

  /* ================= RENDER ================= */

  return (
    <BootstrapDialog open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2, color: 'black' }}>{title}</DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers sx={{ borderColor: "#f3f4f6" }}>
        {description && (
          <DialogContentText sx={{ mb: 3, color: "#6b7280", fontSize: "15px" }}>
            {description}
          </DialogContentText>
        )}

        <form onSubmit={handleSubmit} id="reusable-form">
          {/* Fields */}
          {fields.map((field) => (
            <Box key={field.name} sx={{ mb: 2.5 }}>
              <Box sx={{ mb: 1, fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                {field.placeholder}
              </Box>
              {field.type === "select" ? (
                <StyledSelect
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChangeInput}
                  error={!!formError[field.name]}
                >
                  <option value="">Select {field.placeholder}</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </StyledSelect>
              ) : (
                <StyledTextField
                  name={field.name}
                  placeholder={`Enter ${field.placeholder.toLowerCase()}`}
                  type="text"
                  value={formData[field.name]}
                  onChange={handleChangeInput}
                  error={!!formError[field.name]}
                />
              )}
              {formError[field.name] && (
                <Box sx={{ mt: 0.75, fontSize: "13px", color: "#ef4444", fontWeight: 500 }}>
                  {formError[field.name]}
                </Box>
              )}
            </Box>
          ))}
  
          {/* ================= Permissions ================= */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ 
              mb: 2.5, 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5,
            }}>
              <Shield size={20} color="#6366f1" />
              <Box sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                Access Permissions
              </Box>
            </Box>

            {/* MAIN PERMISSIONS */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1.5,
              }}
            >
              {permissionTree
                .filter(item => item.id !== "settings")
                .map(item => {
                  const isActive = selectedButton.includes(item.id);

                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outlined"
                      startIcon={isActive ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                      onClick={() => handleToggleParent(item.id)}
                      disabled={isPermissionLocked}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        fontWeight: 600,
                        fontSize: "14px",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: "2px solid",

                        backgroundColor: isActive ? "#eef2ff" : "#fff",
                        borderColor: isActive ? "#6366f1" : "#e5e7eb",
                        color: isActive ? "#4338ca" : "#374151",

                        "&:hover": {
                          backgroundColor: isActive ? "#e0e7ff" : "#f9fafb",
                          borderColor: isActive ? "#4f46e5" : "#d1d5db",
                          transform: "translateY(-1px)",
                          boxShadow: isActive 
                            ? "0 4px 12px rgba(99, 102, 241, 0.15)"
                            : "0 2px 8px rgba(0, 0, 0, 0.08)",
                        },

                        "&:active": {
                          transform: "translateY(0)",
                        },
                      }}
                    >
                      {item.name}
                    </Button>
                  );
                })}
            </Box>

            {/* SETTINGS CARD */}
            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: "16px",
                border: "2px solid #e5e7eb",
                backgroundColor: "#fafafa",
                transition: "all 0.3s ease",
              }}
            >
              {/* SETTINGS HEADER */}
              <Button
                fullWidth
                type="button"
                variant="outlined"
                startIcon={
                  selectedButton.includes("settings")
                    ? <Check size={18} strokeWidth={2.5} />
                    : <Plus size={18} strokeWidth={2.5} />
                }
                endIcon={
                  <ChevronDown 
                    size={18} 
                    style={{ 
                      transition: "transform 0.3s ease",
                      transform: expandedSettings ? "rotate(180deg)" : "rotate(0deg)",
                    }} 
                  />
                }
                onClick={() => handleToggleParent("settings")}
                disabled={isPermissionLocked}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "2px solid",
                  borderColor: selectedButton.includes("settings") ? "#6366f1" : "#d1d5db",
                  backgroundColor: selectedButton.includes("settings")
                    ? "#eef2ff"
                    : "#fff",
                  color: selectedButton.includes("settings") ? "#4338ca" : "#374151",
                  
                  "&:hover": {
                    backgroundColor: selectedButton.includes("settings") ? "#e0e7ff" : "#f9fafb",
                    borderColor: selectedButton.includes("settings") ? "#4f46e5" : "#9ca3af",
                    transform: "translateY(-1px)",
                    boxShadow: selectedButton.includes("settings")
                      ? "0 4px 12px rgba(99, 102, 241, 0.15)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                Settings
              </Button>

              {/* SETTINGS CHILDREN */}
              <Collapse in={expandedSettings}>
                <Box
                  sx={{
                    mt: 2.5,
                    pl: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 1.5,
                  }}
                >
                  {permissionTree
                    .find(p => p.id === "settings")
                    ?.children?.map(child => {
                      const active = selectedButton.includes(child.id);

                      return (
                        <Button
                          key={child.id}
                          type="button"
                          variant="outlined"
                          startIcon={active ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
                          onClick={() => handleToggleChild(child.id)}
                          disabled={isPermissionLocked}
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            border: "2px solid",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

                            backgroundColor: active ? "#e0e7ff" : "#fff",
                            borderColor: active ? "#6366f1" : "#e5e7eb",
                            color: active ? "#3730a3" : "#4b5563",

                            "&:hover": {
                              backgroundColor: active ? "#ddd6fe" : "#f9fafb",
                              borderColor: active ? "#4f46e5" : "#d1d5db",
                              transform: "translateX(2px)",
                            },
                          }}
                        >
                          {child.name}
                        </Button>
                      );
                    })}
                </Box>
              </Collapse>
            </Box>

            {/* ERROR */}
            {selectedButtonError && (
              <Fade in={!!selectedButtonError}>
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  color: "#dc2626", 
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                  <span>⚠️</span>
                  {selectedButtonError}
                </Box>
              </Fade>
            )}
          </Box>
        </form>
      </DialogContent>


      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button type="submit" form="reusable-form">
          {submitLabel}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default Modal;
