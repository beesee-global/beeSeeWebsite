// Import React hooks for state management and side effects
import React, { useState, useEffect } from "react";

// Import Material-UI Dialog components for modal functionality
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// Import Material-UI styling utility
import { styled } from "@mui/material/styles";

// Import Material-UI components for layout and form controls
import { Box, Button, Collapse, Checkbox, FormControlLabel } from "@mui/material";

// Import Lucide React icons for UI elements
import { Shield, ChevronDown } from "lucide-react";

/* ================= TYPES ================= */

// Define the structure for each form field configuration
interface FieldConfig {
  name: string; // Unique identifier for the field (used as key in formData object)
  placeholder: string; // Label text shown to user
  type: "text" | "select"; // Type of input control to render
  value: string; // Initial/default value for the field
  options?: { value: string; label: string }[]; // Dropdown options (only for select type)
  validator?: (value: string) => string | undefined; // Optional validation function that returns error message
}

// Define the structure for permission data sent to backend
interface Permission {
  parent_id: string; // ID of parent module (e.g., "settings") or module itself if no parent
  children_id: string; // ID of child module (e.g., "device") or empty string if no children
  module_name: string; // Display name of the module
  module_url: string; // URL path for the module
  actions: string[]; // Array of permitted actions (e.g., ["view", "add", "edit"])
}

// Define props that the Modal component accepts
interface ModalProps {
  open: boolean; // Controls whether modal is visible
  onClose: () => void; // Callback function when modal is closed
  title: string; // Modal header title
  description?: string; // Optional description text below title
  fields: FieldConfig[]; // Array of form fields to render
  onSubmit: (formData: Record<string, any>) => void; // Callback function when form is submitted
  submitLabel?: string; // Text for submit button (defaults to "Submit")
  cancelLabel?: string; // Text for cancel button (defaults to "Cancel")
  initialPermissions?: Permission[]; // Pre-selected permissions (for edit mode)
  isPermissionLocked?: boolean; // If true, permission checkboxes are disabled
}

/* ================= STYLES ================= */

// Create styled input component with custom styles and error state
const StyledInput = styled("input")<{ error?: boolean }>(({ error }) => ({
  width: "100%", // Full width of container
  padding: "12px 16px", // Internal spacing
  fontSize: "15px", // Text size
  fontFamily: "inherit", // Use parent font
  border: `2px solid ${error ? "#ef4444" : "#d1d5db"}`, // Red border if error, gray otherwise
  borderRadius: "12px", // Rounded corners
  outline: "none", // Remove default browser outline
  transition: "all 0.2s ease", // Smooth transitions for all property changes
  backgroundColor: "#fff", // White background
  color: "#111827", // Dark gray text color - THIS IS THE TEXT COLOR
  "&::placeholder": {
    color: "#6b7280", // Gray placeholder text
  },
  "&:focus": {
    // Styles when input is focused
    borderColor: error ? "#ef4444" : "#4b5563", // Darker border on focus
    boxShadow: error
      ? "0 0 0 3px rgba(239, 68, 68, 0.15)" // Red glow if error
      : "0 0 0 3px rgba(107, 114, 128, 0.15)", // Gray glow otherwise
  },
}));

// Create styled select dropdown component with custom styles and error state
const StyledSelect = styled("select")(({ error }: { error?: boolean }) => ({
  width: "100%", // Full width of container
  padding: "12px 16px", // Internal spacing
  fontSize: "15px", // Text size
  fontFamily: "inherit", // Use parent font
  border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`, // Red border if error, light gray otherwise
  borderRadius: "12px", // Rounded corners
  outline: "none", // Remove default browser outline
  transition: "all 0.2s ease", // Smooth transitions
  backgroundColor: "#fff", // White background
  cursor: "pointer", // Show pointer cursor on hover
}));

// Create custom styled Dialog with specific width constraints
const BootstrapDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "750px", // Fixed width for larger screens
    maxWidth: "95%", // Responsive: 95% of screen width on small screens
    maxHeight: "90vh", // Max height is 90% of viewport height (prevents overflow)
  },
});

/* ================= PERMISSION TREE ================= */

// Define the complete permission structure/hierarchy for the application
const permissionTree = [
  {
    id: "dashboard", // Unique identifier for this module
    name: "Dashboard", // Display name shown to user
    url: "/beesee/dashboard", // Route/path for this module
    parent: null, // No parent (top-level module)
    hasActions: false, // This module doesn't have add/edit/delete actions, only access
  },
  {
    id: "job-order",
    name: "Job Order",
    url: "/beesee/job-order",
    parent: null,
    hasActions: true, // This module has action permissions
    allowedActions: ["view", "add", "delete", "close_job_order"], // Job order supports close action
  },
  {
    id: "faqs",
    name: "Faqs",
    url: "/beesee/faqs",
    parent: null,
    hasActions: true,
    allowedActions: ["view", "add", "edit", "delete"], // All standard actions available
  },
  {
    id: "inquiries",
    name: "Inquiries",
    url: "/beesee/inquiries",
    parent: null,
    hasActions: true,
    allowedActions: ["view", "delete", "closed_inquiries"], // Only view and delete (no add/edit)
  },
  {
    id: "careers",
    name: "Careers",
    url: "/beesee/job-posting",
    parent: null,
    hasActions: true,
    allowedActions: ["view", "add", "edit", "delete"], // All actions
  },
  {
    id: "audit-logs",
    name: "Audit Logs",
    url: "/beesee/audit-logs",
    parent: null,
    hasActions: true,
    allowedActions: ["view"], // All actions
  },
  {
    id: "users",
    name: "Users",
    parent: null,
    hasActions: false, // Parent doesn't have actions directly
    children: [
      // Child modules under Users
      {
        id: "list_user",
        name: "Users",
        url: "/beesee/users",
        hasActions: true,
        allowedActions: ["view", "add", "edit", "delete"],
      },
      {
        id: "position",
        name: "Position",
        url: "/beesee/position",
        hasActions: true,
        allowedActions: ["view", "add", "edit", "delete"],
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    parent: null,
    hasActions: false, // Parent doesn't have actions directly
    children: [
      // Child modules under Settings
      {
        id: "device",
        name: "Device type",
        url: "/beesee/device",
        hasActions: true,
        allowedActions: ["view", "add", "edit", "delete"],
      },
      {
        id: "model",
        name: "Model type",
        url: "/beesee/model",
        hasActions: true,
        allowedActions: ["view", "add", "edit", "delete"],
      },
      {
        id: "issue",
        name: "Issue type",
        url: "/beesee/issue",
        hasActions: true,
        allowedActions: ["view", "add", "edit", "delete"],
      },
    ],
  },
];

/* ================= COMPONENT ================= */

// Main Modal component definition
const Modal: React.FC<ModalProps> = ({
  open, // Boolean to control modal visibility
  onClose, // Function to call when closing modal
  title, // Modal title text
  description, // Optional description text
  fields, // Array of form field configurations
  onSubmit, // Function to call when submitting form
  submitLabel = "Submit", // Submit button text (default: "Submit")
  cancelLabel = "Cancel", // Cancel button text (default: "Cancel")
  initialPermissions = [], // Pre-selected permissions (default: empty array)
  isPermissionLocked = false, // Lock permission checkboxes (default: false)
}) => {
  // State to store form field values (key: field name, value: field value)
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // State to store validation errors for form fields
  const [formError, setFormError] = useState<Record<string, string>>({});
  
  // State to store selected permissions (key: module ID, value: array of actions)
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  
  // State to store permission validation error message
  const [permissionError, setPermissionError] = useState("");
  
  // State to control whether Settings section is expanded
  const [expandedSettings, setExpandedSettings] = useState(false);
  
  // State to control whether Users section is expanded
  const [expandedUsers, setExpandedUsers] = useState(false);

  // Effect runs when modal opens - initializes form data and permissions
  useEffect(() => {
    if (open) {
      // Initialize form fields with default values
      const newForm: Record<string, string> = {};
      fields.forEach((f) => (newForm[f.name] = f.value || "")); // Set each field's value
      setFormData(newForm); // Update form data state
      setFormError({}); // Clear any previous errors
      setPermissionError(""); // Clear permission errors

      // Convert initialPermissions array to permissions object for easier state management
      const permMap: Record<string, string[]> = {};
      initialPermissions.forEach((perm) => {
        // Use children_id if exists, otherwise use parent_id as key
        const moduleKey = perm.children_id || perm.parent_id;
        // Store actions array, filtering out empty strings
        permMap[moduleKey] = perm.actions.filter((a) => a !== "");
      });
      setPermissions(permMap); // Update permissions state

      // Debug logging to console
      console.log("=== MODAL INITIALIZED ===");
      console.log("Initial permissions from props:", initialPermissions);
      console.log("Converted to permissions map:", permMap);

      // Auto-expand Settings section if any child module has permissions
      const hasSettingsPerms = ["device", "model", "issue"].some(
        (key) => permMap[key] && permMap[key].length > 0
      );
      setExpandedSettings(hasSettingsPerms);

      // Auto-expand Users section if any child module has permissions
      const hasUsersPerms = ["list_user", "position"].some(
        (key) => permMap[key] && permMap[key].length > 0
      );
      setExpandedUsers(hasUsersPerms);
    }
  }, [open, fields, initialPermissions]); // Re-run when these dependencies change

  // Handle changes to text inputs and select dropdowns
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target; // Extract field name and new value
    setFormData((prev) => ({ ...prev, [name]: value })); // Update form data
    setFormError((prev) => ({ ...prev, [name]: "" })); // Clear error for this field
  };

  // Handle toggling individual action permissions (add, edit, delete)
  const handleActionToggle = (moduleId: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || []; // Get current actions for this module
      
      // Toggle the action: remove if exists, add if doesn't exist
      const updated = current.includes(action)
        ? current.filter((a) => a !== action) // Remove action
        : [...current, action]; // Add action

      // Debug logging
      console.log(`Toggle action ${action} for ${moduleId}:`, {
        current,
        updated,
        willRemove: updated.length === 0,
      });

      // If no actions left (empty array), remove module completely from permissions
      if (updated.length === 0) {
        const { [moduleId]: removed, ...rest } = prev; // Destructure to remove key
        console.log(`Removed ${moduleId} (no actions left), remaining:`, rest);
        return rest; // Return permissions without this module
      }

      // Otherwise, update with new actions array
      return { ...prev, [moduleId]: updated };
    });
    setPermissionError(""); // Clear any permission error
  };

  // Handle toggling "Grant Access" (view permission) - master toggle for modules with actions
  const handleGrantAccessToggle = (moduleId: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || []; // Get current actions
      const hasView = current.includes("view"); // Check if view permission exists

      // Debug logging
      console.log(`Toggle Grant Access for ${moduleId}:`, {
        current,
        hasView,
        willRemove: hasView,
      });

      if (hasView) {
        // If has view, remove module completely from permissions object
        const { [moduleId]: removed, ...rest } = prev; // Destructure to remove
        console.log(`Removed ${moduleId}, remaining:`, rest);
        return rest;
      } else {
        // If no view, add only "view" permission
        const newState = { ...prev, [moduleId]: ["view"] };
        console.log(`Added view to ${moduleId}:`, newState);
        return newState;
      }
    });
    setPermissionError(""); // Clear any permission error
  };

  // Handle toggling access for modules without actions (like Dashboard)
  const handleModuleToggle = (moduleId: string) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || []; // Get current state

      // Debug logging
      console.log(`Toggle module access for ${moduleId}:`, {
        current,
        hasAccess: current.length > 0,
        willRemove: current.length > 0,
      });

      // If has access, remove it completely from the object
      if (current.length > 0) {
        const { [moduleId]: removed, ...rest } = prev; // Destructure to remove
        console.log(`Removed ${moduleId}, remaining:`, rest);
        return rest;
      }
      
      // If no access, grant it (set to array with empty string to indicate access only)
      const newState = { ...prev, [moduleId]: [""] };
      console.log(`Added access to ${moduleId}:`, newState);
      return newState;
    });
    setPermissionError(""); // Clear any permission error
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    // Validate all form fields using their validator functions
    const errors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.validator) {
        const err = field.validator(formData[field.name]); // Run validator
        if (err) errors[field.name] = err; // Store error if validation fails
      }
    });

    // Check if at least one selectable permission is selected
    const hasPermissions = permissionTree.some((parent) => {
      if (parent.children?.length) {
        return parent.children.some((child) => (permissions[child.id] || []).length > 0);
      }
      return (permissions[parent.id] || []).length > 0;
    });
    if (!hasPermissions) {
      setPermissionError("Please select at least one permission"); // Set error message
    }

    // If there are validation errors or no permissions, stop submission
    if (Object.keys(errors).length > 0 || !hasPermissions) {
      setFormError(errors); // Display errors
      return; // Exit function
    }

    // Transform permissions object to backend format in permissionTree order.
    // This prevents parent-only modules (e.g. users/settings) from being sent.
    const formattedPermissions: Permission[] = [];

    permissionTree.forEach((parent) => {
      if (parent.children?.length) {
        parent.children.forEach((child) => {
          const actions = permissions[child.id];
          if (!actions || actions.length === 0) return;

          formattedPermissions.push({
            parent_id: parent.id,
            children_id: child.id,
            module_name: child.name,
            module_url: child.url || "",
            actions,
          });
        });
        return;
      }

      const actions = permissions[parent.id];
      if (!actions || actions.length === 0) return;

      formattedPermissions.push({
        parent_id: parent.id,
        children_id: "",
        module_name: parent.name,
        module_url: parent.url || "",
        actions,
      });
    });

    console.log("Formatted permissions to submit:", formattedPermissions);

    // Call parent component's onSubmit with form data and formatted permissions
    onSubmit({
      ...formData, // Spread form field values
      permissions: formattedPermissions, // Add formatted permissions
    });

    onClose(); // Close the modal
  };

  // Render permission checkboxes for a single module
  const renderModuleCheckboxes = (
    moduleId: string, // Unique identifier for the module
    moduleName: string, // Display name
    hasActions: boolean = true, // Whether module has add/edit/delete actions
    allowedActions: string[] = ["view", "add", "edit", "delete"], // Which actions are available
    isChild = false // Whether this is a child module (affects styling)
  ) => {
    const moduleActions = permissions[moduleId] || []; // Get current actions for this module
    const hasAnyAction = moduleActions.length > 0 || permissions[moduleId] !== undefined; // Check if module has any permissions
    const hasGrantAccess = moduleActions.includes("view"); // Check if view permission exists

    // For modules without actions (like Dashboard), show only access toggle
    if (!hasActions) {
      const hasAccess = permissions[moduleId] !== undefined; // Check if module has access

      return (
        <Box
          key={moduleId} // Unique key for React list rendering
          sx={{
            p: 2.5, // Padding
            borderRadius: "14px", // Rounded corners
            border: "2px solid", // Border width
            borderColor: hasAccess ? "#e0e7ff" : "#f3f4f6", // Blue border if has access, gray otherwise
            backgroundColor: hasAccess ? "#fafbff" : "#fff", // Light blue background if has access
            transition: "all 0.2s ease", // Smooth transitions
            "&:hover": {
              // Hover styles
              borderColor: hasAccess ? "#c7d2fe" : "#e5e7eb", // Darker border on hover
              backgroundColor: hasAccess ? "#f5f7ff" : "#fafafa", // Slightly darker background
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Module name */}
            <Box
              sx={{
                fontSize: isChild ? "14px" : "15px", // Smaller font if child module
                fontWeight: 700, // Bold
                color: "#111827", // Dark gray
              }}
            >
              {moduleName}
            </Box>

            {/* Grant Access checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasAccess} // Checked if module has access
                  onChange={() => handleModuleToggle(moduleId)} // Toggle on click
                  disabled={isPermissionLocked} // Disabled if locked
                  sx={{
                    color: "#9ca3af", // Gray when unchecked
                    padding: "6px", // Internal padding
                    "&.Mui-checked": { color: "#374151" }, // Dark gray when checked
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Grant Access
                  </span>
                </Box>
              }
            />
          </Box>
        </Box>
      );
    }

    // For modules with actions (add/edit/delete)
    return (
      <Box
        key={moduleId} // Unique key for React list rendering
        sx={{
          p: 2.5, // Padding
          borderRadius: "14px", // Rounded corners
          border: "2px solid", // Border width
          borderColor: hasAnyAction ? "#e0e7ff" : "#f3f4f6", // Blue border if has permissions
          backgroundColor: hasAnyAction ? "#fafbff" : "#fff", // Light blue background if has permissions
          transition: "all 0.2s ease", // Smooth transitions
          "&:hover": {
            // Hover styles
            borderColor: hasAnyAction ? "#c7d2fe" : "#e5e7eb",
            backgroundColor: hasAnyAction ? "#f5f7ff" : "#fafafa",
          },
        }}
      >
        {/* Module name header */}
        <Box
          sx={{
            fontSize: isChild ? "14px" : "15px", // Smaller font if child
            fontWeight: 700, // Bold
            color: "#111827", // Dark gray
            mb: 2, // Margin bottom
          }}
        >
          {moduleName}
        </Box>

        {/* Action checkboxes container */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {/* Grant Access Checkbox (Master Toggle) - Always show if view is allowed */}
          {allowedActions.includes("view") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasGrantAccess} // Checked if has view permission
                  onChange={() => handleGrantAccessToggle(moduleId)} // Toggle on click
                  disabled={isPermissionLocked} // Disabled if locked
                  sx={{
                    color: "#9ca3af", // Gray when unchecked
                    padding: "6px", // Internal padding
                    "&.Mui-checked": { color: "#374151" }, // Dark gray when checked
                    "&:hover": { backgroundColor: "rgba(99, 102, 241, 0.08)" }, // Light purple on hover
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600, // Semi-bold
                    }}
                  >
                    Grant Access
                  </span>
                </Box>
              }
            />
          )}

          {/* Add Checkbox - Only show if allowed in allowedActions array */}
          {allowedActions.includes("add") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={moduleActions.includes("add")} // Checked if add permission exists
                  onChange={() => handleActionToggle(moduleId, "add")} // Toggle on click
                  disabled={isPermissionLocked || !hasGrantAccess} // Disabled if locked or no view permission
                  sx={{
                    color: "#9ca3af", // Gray when unchecked
                    padding: "6px",
                    "&.Mui-checked": { color: "#374151" }, // Dark gray when checked
                    "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)" }, // Light green on hover
                    "&.Mui-disabled": {
                      color: "#e5e7eb", // Very light gray when disabled
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: !hasGrantAccess ? "#d1d5db" : "#374151", // Gray out if disabled
                    }}
                  >
                    Add
                  </span>
                </Box>
              }
            />
          )}

          {/* Edit Checkbox - Only show if allowed in allowedActions array */}
          {allowedActions.includes("edit") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={moduleActions.includes("edit")} // Checked if edit permission exists
                  onChange={() => handleActionToggle(moduleId, "edit")} // Toggle on click
                  disabled={isPermissionLocked || !hasGrantAccess} // Disabled if locked or no view permission
                  sx={{
                    color: "#9ca3af", // Gray when unchecked
                    padding: "6px",
                    "&.Mui-checked": { color: "#374151" }, // Dark gray when checked
                    "&:hover": { backgroundColor: "rgba(245, 158, 11, 0.08)" }, // Light orange on hover
                    "&.Mui-disabled": {
                      color: "#e5e7eb", // Very light gray when disabled
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: !hasGrantAccess ? "#d1d5db" : "#374151", // Gray out if disabled
                    }}
                  >
                    Edit
                  </span>
                </Box>
              }
            />
          )}

          {/* Delete Checkbox - Only show if allowed in allowedActions array */}
          {allowedActions.includes("delete") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={moduleActions.includes("delete")} // Checked if delete permission exists
                  onChange={() => handleActionToggle(moduleId, "delete")} // Toggle on click
                  disabled={isPermissionLocked || !hasGrantAccess} // Disabled if locked or no view permission
                  sx={{
                    color: "#9ca3af", // Gray when unchecked
                    padding: "6px",
                    "&.Mui-checked": { color: "#374151" }, // Dark gray when checked
                    "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" }, // Light red on hover
                    "&.Mui-disabled": {
                      color: "#e5e7eb", // Very light gray when disabled
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: !hasGrantAccess ? "#d1d5db" : "#374151", // Gray out if disabled
                    }}
                  >
                    Delete
                  </span>
                </Box>
              }
            />
          )}

          {/* Close Job Order Checkbox - Only show if allowed in allowedActions array */}
          {allowedActions.includes("close_job_order") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={moduleActions.includes("close_job_order")}
                  onChange={() => handleActionToggle(moduleId, "close_job_order")}
                  disabled={isPermissionLocked || !hasGrantAccess}
                  sx={{
                    color: "#9ca3af",
                    padding: "6px",
                    "&.Mui-checked": { color: "#374151" },
                    "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.08)" },
                    "&.Mui-disabled": {
                      color: "#e5e7eb",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: !hasGrantAccess ? "#d1d5db" : "#374151",
                    }}
                  >
                    Close Job Order
                  </span>
                </Box>
              }
            />
          )}

          {/* Closed Inquiries Checkbox - Only show if allowed in allowedActions array */}
          {allowedActions.includes("closed_inquiries") && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={moduleActions.includes("closed_inquiries")}
                  onChange={() => handleActionToggle(moduleId, "closed_inquiries")}
                  disabled={isPermissionLocked || !hasGrantAccess}
                  sx={{
                    color: "#9ca3af",
                    padding: "6px",
                    "&.Mui-checked": { color: "#374151" },
                    "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.08)" },
                    "&.Mui-disabled": {
                      color: "#e5e7eb",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: !hasGrantAccess ? "#d1d5db" : "#374151",
                    }}
                  >
                    Closed Inquiries
                  </span>
                </Box>
              }
            />
          )}
        </Box>
      </Box>
    );
  };

  // Main component render
  return (
    <BootstrapDialog open={open} onClose={onClose}>
      {/* Modal header with title */}
      <DialogTitle
        sx={{
          m: 0, // No margin
          p: 2.5, // Padding
          fontSize: "20px", // Large text
          fontWeight: 700, // Bold
          color: "#111827", // Dark gray
        }}
      >
        {title}
      </DialogTitle>

      {/* Close button (X icon in top right) */}
      <IconButton
        onClick={onClose} // Close modal on click
        sx={{
          position: "absolute", // Position absolutely in dialog
          right: 12, // 12px from right edge
          top: 12, // 12px from top edge
          backgroundColor: "#f3f4f6", // Light gray background
          "&:hover": {
            backgroundColor: "#e5e7eb", // Darker gray on hover
            transform: "rotate(90deg)", // Rotate icon on hover
          },
          transition: "all 0.2s ease", // Smooth transitions
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Modal body content */}
      <DialogContent dividers sx={{ borderColor: "#f3f4f6" }}>
        {/* Optional description text */}
        {description && (
          <Box sx={{ mb: 3, color: "#6b7280", fontSize: "15px" }}>
            {description}
          </Box>
        )}

        {/* Form element */}
        <form onSubmit={handleSubmit} id="permission-form">
          {/* Render all form fields */}
          {fields.map((field) => (
            <Box key={field.name} sx={{ mb: 2.5 }}>
              {/* Field label */}
              <Box
                sx={{
                  mb: 1, // Margin bottom
                  fontSize: "14px",
                  fontWeight: 600, // Semi-bold
                  color: "#374151", // Dark gray
                }}
              >
                {field.placeholder}
              </Box>

              {/* Render select dropdown or text input based on field type */}
              {field.type === "select" ? (
                <StyledSelect
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  error={!!formError[field.name]} // Pass error state
                >
                  <option value="">Select {field.placeholder}</option>
                  {/* Render all dropdown options */}
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
                  error={!!formError[field.name]} // Pass error state
                />
              )}

              {/* Show error message if validation fails */}
              {formError[field.name] && (
                <Box
                  sx={{
                    mt: 0.75, // Margin top
                    fontSize: "13px",
                    color: "#ef4444", // Red text
                    fontWeight: 500,
                  }}
                >
                  {formError[field.name]}
                </Box>
              )}
            </Box>
          ))}

          {/* Permissions Section */}
          <Box sx={{ mt: 4 }}>
            {/* Section header with icon */}
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                pb: 2,
                borderBottom: "2px solid #f3f4f6", // Bottom border
              }}
            >
              {/* Shield icon with yellow gradient background */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  background:
                    "linear-gradient(90deg, #FCD000 0%, rgba(252, 208, 0, 0.9) 100%)",
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

            {/* Main Modules - render all except Settings and Users */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {permissionTree
                .filter((item) => item.id !== "settings" && item.id !== "users") // Exclude Settings and Users (they're rendered separately below)
                .map((item) =>
                  renderModuleCheckboxes(
                    item.id,
                    item.name,
                    item.hasActions,
                    item.allowedActions || ["view", "add", "edit", "delete"] // Use default actions if not specified
                  )
                )}
            </Box>

            {/* Users Section - Collapsible */}
            <Box
              sx={{
                mt: 3, // Margin top
                p: 2.5, // Padding
                borderRadius: "16px", // Rounded corners
                border: "2px solid #e5e7eb", // Light gray border
                backgroundColor: "#fafafa", // Very light gray background
              }}
            >
              {/* Users expand/collapse button */}
              <Button
                fullWidth
                type="button" // Not a submit button
                variant="text" // Text style (no background)
                endIcon={
                  <ChevronDown
                    size={18}
                    style={{
                      transition: "transform 0.3s ease", // Smooth rotation
                      transform: expandedUsers
                        ? "rotate(180deg)" // Point up when expanded
                        : "rotate(0deg)", // Point down when collapsed
                    }}
                  />
                }
                onClick={() => setExpandedUsers(!expandedUsers)} // Toggle expanded state
                sx={{
                  justifyContent: "space-between", // Space between text and icon
                  textTransform: "none", // Don't uppercase text
                  padding: "14px 18px",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#111827",
                  borderRadius: "12px",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" }, // Slight gray on hover
                }}
              >
                Users
              </Button>

              {/* Collapsible content for Users children */}
              <Collapse in={expandedUsers}>
                <Box
                  sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {/* Render child modules under Users */}
                  {permissionTree
                    .find((p) => p.id === "users") // Find Users parent
                    ?.children?.map((child) =>
                      renderModuleCheckboxes(
                        child.id,
                        child.name,
                        child.hasActions,
                        child.allowedActions || ["view", "add", "edit", "delete"],
                        true // isChild = true for different styling
                      )
                    )}
                </Box>
              </Collapse>
            </Box>

            {/* Settings Section - Collapsible */}
            <Box
              sx={{
                mt: 3, // Margin top
                p: 2.5, // Padding
                borderRadius: "16px", // Rounded corners
                border: "2px solid #e5e7eb", // Light gray border
                backgroundColor: "#fafafa", // Very light gray background
              }}
            >
              {/* Settings expand/collapse button */}
              <Button
                fullWidth
                type="button" // Not a submit button
                variant="text" // Text style (no background)
                endIcon={
                  <ChevronDown
                    size={18}
                    style={{
                      transition: "transform 0.3s ease", // Smooth rotation
                      transform: expandedSettings
                        ? "rotate(180deg)" // Point up when expanded
                        : "rotate(0deg)", // Point down when collapsed
                    }}
                  />
                }
                onClick={() => setExpandedSettings(!expandedSettings)} // Toggle expanded state
                sx={{
                  justifyContent: "space-between", // Space between text and icon
                  textTransform: "none", // Don't uppercase text
                  padding: "14px 18px",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#111827",
                  borderRadius: "12px",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" }, // Slight gray on hover
                }}
              >
                Settings
              </Button>

              {/* Collapsible content for Settings children */}
              <Collapse in={expandedSettings}>
                <Box
                  sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {/* Render child modules under Settings */}
                  {permissionTree
                    .find((p) => p.id === "settings") // Find Settings parent
                    ?.children?.map((child) =>
                      renderModuleCheckboxes(
                        child.id,
                        child.name,
                        child.hasActions,
                        child.allowedActions || ["view", "add", "edit", "delete"],
                        true // isChild = true for different styling
                      )
                    )}
                </Box>
              </Collapse>
            </Box>

            {/* Permission Error Message - shows when no permissions selected */}
            {permissionError && (
              <Box
                sx={{
                  mt: 2.5,
                  p: 1.5,
                  backgroundColor: "#fef2f2", // Light red background
                  border: "1px solid #fecaca", // Red border
                  borderRadius: "10px",
                  color: "#dc2626", // Red text
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

      {/* Modal footer with action buttons */}
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        {/* Cancel button */}
        <Button
          onClick={onClose} // Close modal without saving
          sx={{
            px: 3, // Horizontal padding
            py: 1.25, // Vertical padding
            borderRadius: "10px",
            textTransform: "none", // Don't uppercase text
            fontWeight: 600,
            fontSize: "15px",
            color: "#374151", // Dark gray text
            backgroundColor: "#f3f4f6", // Light gray background
            "&:hover": { backgroundColor: "#e5e7eb" }, // Darker gray on hover
          }}
        >
          {cancelLabel}
        </Button>

        {/* Submit button */}
        <Button
          type="submit" // Submits the form
          form="permission-form" // Associates with form by ID
          variant="contained"
          className="bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 text-black" // Tailwind classes for yellow gradient
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "15px",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)", // Purple shadow
            "&:hover": {
              background: "", // Empty to allow Tailwind gradient
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)", // Larger shadow on hover
              transform: "translateY(-1px)", // Slight lift effect
            },
            transition: "all 0.2s ease", // Smooth transitions
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

// Export component for use in other files
export default Modal;

