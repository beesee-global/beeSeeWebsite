import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { Box, Button, Collapse, Checkbox, FormControlLabel } from "@mui/material";
import { Shield, ChevronDown, Plus, Edit, Trash2, Eye } from "lucide-react";

/* ================= TYPES ================= */
interface FieldConfig {
  name: string;
  placeholder: string;
  type: "text" | "select";
  value: string;
  options?: { value: string; label: string }[];
  validator?: (value: string) => string | undefined;
}

interface Permission {
  parent_id: string;
  children_id: string;
  module_name: string;
  module_url: string;
  actions: string[];
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
  initialPermissions?: Permission[];
  isPermissionLocked?: boolean;
}

/* ================= STYLES ================= */
const StyledInput = styled("input")(({ error }: { error?: boolean }) => ({
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
}));

const StyledSelect = styled("select")(({ error }: { error?: boolean }) => ({
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  fontFamily: "inherit",
  border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`,
  borderRadius: "12px",
  outline: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#fff",
  cursor: "pointer",
}));

const BootstrapDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "750px",
    maxWidth: "95%",
    maxHeight: "90vh",
  },
});

/* ================= PERMISSION TREE ================= */
const permissionTree = [
  { 
    id: "dashboard", 
    name: "Dashboard", 
    url: "/beesee/dashboard", 
    parent: null,
    hasActions: false // Dashboard has no actions, just access
  },
  { 
    id: "job-order", 
    name: "Job Order", 
    url: "/beesee/job-order", 
    parent: null,
    hasActions: true
  },
  { 
    id: "faqs", 
    name: "Faqs", 
    url: "/beesee/faqs", 
    parent: null,
    hasActions: true
  },
  { 
    id: "inquiries", 
    name: "Inquiries", 
    url: "/beesee/inquiries", 
    parent: null,
    hasActions: true
  },
  { 
    id: "careers", 
    name: "Careers", 
    url: "/beesee/job-posting", 
    parent: null,
    hasActions: true
  },
  {
    id: "settings",
    name: "Settings",
    parent: null,
    hasActions: false,
    children: [
      { id: "device", name: "Device type", url: "/beesee/device", hasActions: true },
      { id: "model", name: "Model type", url: "/beesee/model", hasActions: true },
      { id: "issue", name: "Issue type", url: "/beesee/issue", hasActions: true },
      { id: "position", name: "Position", url: "/beesee/position", hasActions: true },
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
  isPermissionLocked = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [permissionError, setPermissionError] = useState("");
  const [expandedSettings, setExpandedSettings] = useState(false);

  // Initialize form data and permissions
  useEffect(() => {
    if (open) {
      // Initialize form fields
      const newForm: Record<string, string> = {};
      fields.forEach((f) => (newForm[f.name] = f.value || ""));
      setFormData(newForm);
      setFormError({});
      setPermissionError("");

      // Convert initialPermissions array to permissions object
      const permMap: Record<string, string[]> = {};
      initialPermissions.forEach((perm) => {
        const moduleKey = perm.children_id || perm.parent_id;
        permMap[moduleKey] = perm.actions.filter(a => a !== ""); // Filter out empty strings
      });
      setPermissions(permMap);

      console.log("=== MODAL INITIALIZED ===");
      console.log("Initial permissions from props:", initialPermissions);
      console.log("Converted to permissions map:", permMap);

      // Auto-expand settings if any child has permissions
      const hasSettingsPerms = ["device", "model", "issue", "position"].some(
        key => permMap[key] && permMap[key].length > 0
      );
      setExpandedSettings(hasSettingsPerms);
    }
  }, [open, fields, initialPermissions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleActionToggle = (moduleId: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      
      console.log(`Toggle action ${action} for ${moduleId}:`, {
        current,
        updated,
        willRemove: updated.length === 0
      });
      
      // If no actions left (empty array), remove module completely
      if (updated.length === 0) {
        const { [moduleId]: removed, ...rest } = prev;
        console.log(`Removed ${moduleId} (no actions left), remaining:`, rest);
        return rest;
      }
      
      return { ...prev, [moduleId]: updated };
    });
    setPermissionError("");
  };

  // Handle Grant Access toggle (view permission)
  const handleGrantAccessToggle = (moduleId: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || [];
      const hasView = current.includes("view");
      
      console.log(`Toggle Grant Access for ${moduleId}:`, {
        current,
        hasView,
        willRemove: hasView
      });
      
      if (hasView) {
        // Remove module completely from permissions object
        const { [moduleId]: removed, ...rest } = prev;
        console.log(`Removed ${moduleId}, remaining:`, rest);
        return rest;
      } else {
        // Add only "view" permission
        const newState = { ...prev, [moduleId]: ["view"] };
        console.log(`Added view to ${moduleId}:`, newState);
        return newState;
      }
    });
    setPermissionError("");
  };

  // Handle module access (for modules without actions like Dashboard)  
  const handleModuleToggle = (moduleId: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || [];
      
      console.log(`Toggle module access for ${moduleId}:`, {
        current,
        hasAccess: current.length > 0,
        willRemove: current.length > 0
      });
      
      // If has access, remove it completely from the object
      if (current.length > 0) {
        const { [moduleId]: removed, ...rest } = prev;
        console.log(`Removed ${moduleId}, remaining:`, rest);
        return rest;
      }
      // If no access, grant it (set to empty array with empty string to indicate access only)
      const newState = { ...prev, [moduleId]: [""] };
      console.log(`Added access to ${moduleId}:`, newState);
      return newState;
    });
    setPermissionError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    const errors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.validator) {
        const err = field.validator(formData[field.name]);
        if (err) errors[field.name] = err;
      }
    });

    console.log("=== SUBMIT DEBUG ===");
    console.log("Current permissions state:", permissions);
    console.log("Permissions entries:", Object.entries(permissions));

    // Check if at least one permission is selected
    const hasPermissions = Object.keys(permissions).length > 0;
    if (!hasPermissions) {
      setPermissionError("Please select at least one permission");
    }

    if (Object.keys(errors).length > 0 || !hasPermissions) {
      setFormError(errors);
      return;
    }

    // Transform permissions to backend format
    const formattedPermissions: Permission[] = [];
    Object.entries(permissions).forEach(([moduleKey, actions]) => {
      console.log(`Processing module: ${moduleKey}, actions:`, actions);
      
      // Find module info from permissionTree
      const allModules = permissionTree.flatMap((p) => 
        p.children ? [p, ...p.children] : [p]
      );
      const module = allModules.find((m) => m.id === moduleKey);

      if (module) {
        // Find parent if exists
        const parent = permissionTree.find((p) => 
          p.children?.some((c) => c.id === moduleKey)
        );

        formattedPermissions.push({
          parent_id: parent ? parent.id : moduleKey,
          children_id: parent ? moduleKey : "",
          module_name: module.name,
          module_url: module.url || "",
          actions: actions,
        });
      }
    });

    console.log("Formatted permissions to submit:", formattedPermissions);

    onSubmit({
      ...formData,
      permissions: formattedPermissions,
    });

    onClose();
  };

  const renderModuleCheckboxes = (
    moduleId: string, 
    moduleName: string, 
    hasActions: boolean = true,
    isChild = false
  ) => {
    const moduleActions = permissions[moduleId] || [];
    const hasAnyAction = moduleActions.length > 0 || permissions[moduleId] !== undefined;
    const hasGrantAccess = moduleActions.includes("view");

    // For modules without actions (like Dashboard), show only access toggle
    if (!hasActions) {
      const hasAccess = permissions[moduleId] !== undefined;
      
      return (
        <Box
          key={moduleId}
          sx={{
            p: 2.5,
            borderRadius: "14px",
            border: "2px solid",
            borderColor: hasAccess ? "#e0e7ff" : "#f3f4f6",
            backgroundColor: hasAccess ? "#fafbff" : "#fff",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: hasAccess ? "#c7d2fe" : "#e5e7eb",
              backgroundColor: hasAccess ? "#f5f7ff" : "#fafafa",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ fontSize: isChild ? "14px" : "15px", fontWeight: 700, color: "#111827" }}>
              {moduleName}
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasAccess}
                  onChange={() => handleModuleToggle(moduleId)}
                  disabled={isPermissionLocked}
                  sx={{
                    color: "#9ca3af",
                    padding: "6px",
                    "&.Mui-checked": { color: "#6366f1" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Grant Access
                  </span>
                </Box>
              }
            />
          </Box>
        </Box>
      );
    }

    // For modules with actions
    return (
      <Box
        key={moduleId}
        sx={{
          p: 2.5,
          borderRadius: "14px",
          border: "2px solid",
          borderColor: hasAnyAction ? "#e0e7ff" : "#f3f4f6",
          backgroundColor: hasAnyAction ? "#fafbff" : "#fff",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: hasAnyAction ? "#c7d2fe" : "#e5e7eb",
            backgroundColor: hasAnyAction ? "#f5f7ff" : "#fafafa",
          },
        }}
      >
        <Box sx={{ 
          fontSize: isChild ? "14px" : "15px", 
          fontWeight: 700, 
          color: "#111827", 
          mb: 2 
        }}>
          {moduleName}
        </Box>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {/* Grant Access Checkbox (Master Toggle) */}
          <FormControlLabel
            control={
              <Checkbox
                checked={hasGrantAccess}
                onChange={() => handleGrantAccessToggle(moduleId)}
                disabled={isPermissionLocked}
                sx={{
                  color: "#9ca3af",
                  padding: "6px",
                  "&.Mui-checked": { color: "#6366f1" },
                  "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.08)" },
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Eye 
                  size={16} 
                  color={hasGrantAccess ? "#6366f1" : "#9ca3af"} 
                />
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  color: hasGrantAccess ? "#6366f1" : "#374151" 
                }}>
                  Grant Access
                </span>
              </Box>
            }
          />

          {/* Add Checkbox - Disabled if no Grant Access */}
          <FormControlLabel
            control={
              <Checkbox
                checked={moduleActions.includes("add")}
                onChange={() => handleActionToggle(moduleId, "add")}
                disabled={isPermissionLocked || !hasGrantAccess}
                sx={{
                  color: "#9ca3af",
                  padding: "6px",
                  "&.Mui-checked": { color: "#10b981" },
                  "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)" },
                  "&.Mui-disabled": {
                    color: "#e5e7eb",
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Plus 
                  size={16} 
                  color={
                    !hasGrantAccess ? "#e5e7eb" : 
                    moduleActions.includes("add") ? "#10b981" : "#9ca3af"
                  } 
                />
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  color: !hasGrantAccess ? "#d1d5db" : "#374151" 
                }}>
                  Add
                </span>
              </Box>
            }
          />

          {/* Edit Checkbox - Disabled if no Grant Access */}
          <FormControlLabel
            control={
              <Checkbox
                checked={moduleActions.includes("edit")}
                onChange={() => handleActionToggle(moduleId, "edit")}
                disabled={isPermissionLocked || !hasGrantAccess}
                sx={{
                  color: "#9ca3af",
                  padding: "6px",
                  "&.Mui-checked": { color: "#f59e0b" },
                  "&:hover": { backgroundColor: "rgba(245, 158, 11, 0.08)" },
                  "&.Mui-disabled": {
                    color: "#e5e7eb",
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Edit 
                  size={16} 
                  color={
                    !hasGrantAccess ? "#e5e7eb" : 
                    moduleActions.includes("edit") ? "#f59e0b" : "#9ca3af"
                  } 
                />
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  color: !hasGrantAccess ? "#d1d5db" : "#374151" 
                }}>
                  Edit
                </span>
              </Box>
            }
          />

          {/* Delete Checkbox - Disabled if no Grant Access */}
          <FormControlLabel
            control={
              <Checkbox
                checked={moduleActions.includes("delete")}
                onChange={() => handleActionToggle(moduleId, "delete")}
                disabled={isPermissionLocked || !hasGrantAccess}
                sx={{
                  color: "#9ca3af",
                  padding: "6px",
                  "&.Mui-checked": { color: "#ef4444" },
                  "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
                  "&.Mui-disabled": {
                    color: "#e5e7eb",
                  },
                }}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Trash2 
                  size={16} 
                  color={
                    !hasGrantAccess ? "#e5e7eb" : 
                    moduleActions.includes("delete") ? "#ef4444" : "#9ca3af"
                  } 
                />
                <span style={{ 
                  fontSize: "14px", 
                  fontWeight: 500, 
                  color: !hasGrantAccess ? "#d1d5db" : "#374151" 
                }}>
                  Delete
                </span>
              </Box>
            }
          />
        </Box>
      </Box>
    );
  };

  return (
    <BootstrapDialog open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2.5, fontSize: "20px", fontWeight: 700, color: "#111827" }}>
        {title}
      </DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          backgroundColor: "#f3f4f6",
          "&:hover": { 
            backgroundColor: "#e5e7eb",
            transform: "rotate(90deg)" 
          },
          transition: "all 0.2s ease",
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers sx={{ borderColor: "#f3f4f6" }}>
        {description && (
          <Box sx={{ mb: 3, color: "#6b7280", fontSize: "15px" }}>
            {description}
          </Box>
        )}

        <form onSubmit={handleSubmit} id="permission-form">
          {/* Form Fields */}
          {fields.map((field) => (
            <Box key={field.name} sx={{ mb: 2.5 }}>
              <Box sx={{ mb: 1, fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                {field.placeholder}
              </Box>
              {field.type === "select" ? (
                <StyledSelect
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  error={!!formError[field.name]}
                >
                  <option value="">Select {field.placeholder}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </StyledSelect>
              ) : (
                <StyledInput
                  name={field.name}
                  placeholder={`Enter ${field.placeholder.toLowerCase()}`}
                  value={formData[field.name]}
                  onChange={handleInputChange}
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

          {/* Permissions Section */}
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                pb: 2,
                borderBottom: "2px solid #f3f4f6",
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={20} color="#fff" />
              </Box>
              <Box sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                Access Permissions
              </Box>
            </Box>

            {/* Main Modules */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {permissionTree
                .filter((item) => item.id !== "settings")
                .map((item) => renderModuleCheckboxes(item.id, item.name, item.hasActions))}
            </Box>

            {/* Settings Section */}
            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: "16px",
                border: "2px solid #e5e7eb",
                backgroundColor: "#fafafa",
              }}
            >
              <Button
                fullWidth
                type="button"
                variant="text"
                endIcon={
                  <ChevronDown
                    size={18}
                    style={{
                      transition: "transform 0.3s ease",
                      transform: expandedSettings ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                }
                onClick={() => setExpandedSettings(!expandedSettings)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  padding: "14px 18px",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#111827",
                  borderRadius: "12px",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                Settings
              </Button>

              <Collapse in={expandedSettings}>
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  {permissionTree
                    .find((p) => p.id === "settings")
                    ?.children?.map((child) =>
                      renderModuleCheckboxes(child.id, child.name, child.hasActions, true)
                    )}
                </Box>
              </Collapse>
            </Box>

            {/* Error Message */}
            {permissionError && (
              <Box
                sx={{
                  mt: 2.5,
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
                }}
              >
                <span>⚠️</span>
                {permissionError}
              </Box>
            )}
          </Box>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "15px",
            color: "#374151",
            backgroundColor: "#f3f4f6",
            "&:hover": { backgroundColor: "#e5e7eb" },
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          form="permission-form"
          variant="contained"
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "15px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default Modal;