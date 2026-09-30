import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import { userAuth } from "../../../hooks/userAuth";
import {
  createEcommerceUser,
  fetchEcommercePositions,
  fetchEcommerceUserById,
  updateEcommerceUser,
  type EcommerceUserPayload,
} from "../../../services/Ecommerce/userServices";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  positions_id: string;
  status: string;
  phone: string;
  address: string;
};

const initialForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  role: "regular",
  positions_id: "",
  status: "Active",
  phone: "",
  address: "",
};

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#d9ad00] focus:ring-1 focus:ring-[#d9ad00]";

const TeamMembersForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { snackBarMessage, snackBarType, snackBarOpen, setSnackBarMessage, setSnackBarType, setSnackBarOpen } = userAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = Boolean(id);

  const { data: existingUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["ecommerce-user", id],
    queryFn: () => fetchEcommerceUserById(String(id)),
    enabled: isEditMode,
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["ecommerce-positions"],
    queryFn: fetchEcommercePositions,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: EcommerceUserPayload) =>
      isEditMode
        ? updateEcommerceUser({ id: String(id), data: payload })
        : createEcommerceUser(payload),
  });

  useEffect(() => {
    if (!existingUser) return;
    setForm({
      first_name: existingUser.first_name || "",
      last_name: existingUser.last_name || "",
      email: existingUser.email || "",
      password: "",
      confirm_password: "",
      role: existingUser.role || "regular",
      positions_id: existingUser.positions_id == null ? "" : String(existingUser.positions_id),
      status: existingUser.status || "Active",
      phone: existingUser.phone || "",
      address: existingUser.address || "",
    });
  }, [existingUser]);

  const setField = (name: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.first_name.trim()) nextErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (!isEditMode && !form.password) nextErrors.password = "Password is required.";
    if (form.password && form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (form.password && form.password !== form.confirm_password) nextErrors.confirm_password = "Passwords do not match.";
    if (!form.role) nextErrors.role = "Role is required.";
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload: EcommerceUserPayload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      role: form.role,
      positions_id: form.positions_id ? Number(form.positions_id) : null,
      status: form.status,
      phone: form.phone.trim(),
      address: form.address.trim(),
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      await saveMutation.mutateAsync(payload);
      setSnackBarType("success");
      setSnackBarMessage(isEditMode ? "Team member updated successfully." : "Team member created successfully.");
      setSnackBarOpen(true);
      navigate("/beesee/ecommerce/team-members");
    } catch (error: any) {
      setSnackBarType("error");
      setSnackBarMessage(error?.response?.data?.message || "Unable to save team member.");
      setSnackBarOpen(true);
    }
  };

  const field = (name: keyof FormState, label: string, type = "text", required = false) => (
    <label className="block text-sm font-medium text-gray-700">
      <span className="mb-1.5 block">{label}{required ? " *" : ""}</span>
      <input
        type={type}
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        className={inputClass}
        autoComplete={name === "password" ? "new-password" : name}
      />
      {errors[name] && <span className="mt-1 block text-xs text-red-600">{errors[name]}</span>}
    </label>
  );

  if (isEditMode && isLoadingUser) {
    return <div className="p-8 text-sm text-gray-500">Loading team member...</div>;
  }

  return (
    <div className="min-h-full bg-slate-50 py-6 sm:py-8">
      <SnackbarTechnician open={snackBarOpen} type={snackBarType} message={snackBarMessage} onClose={() => setSnackBarOpen(false)} />
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Team Members", href: "/beesee/ecommerce/team-members", icon: <UserRound className="h-4 w-4" /> }, { label: isEditMode ? "Edit User" : "Add User", isActive: true }]} />
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Team Member" : "Add Team Member"}</h1>
              <p className="mt-1 text-sm text-gray-500">Manage access to the ecommerce panel.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate("/beesee/ecommerce/team-members")} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" /> Cancel
              </button>
              <button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[#FCD000] px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-[#e9c000] disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="h-4 w-4" /> {saveMutation.isPending ? "Saving..." : "Save User"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {field("first_name", "First name", "text", true)}
            {field("last_name", "Last name", "text", true)}
            {field("email", "Email", "email", true)}
            {field("phone", "Phone")}
            {field("password", isEditMode ? "New password" : "Password", "password", !isEditMode)}
            {field("confirm_password", "Confirm password", "password", !isEditMode)}

            <label className="block text-sm font-medium text-gray-700">
              <span className="mb-1.5 block">Role *</span>
              <select value={form.role} onChange={(event) => setField("role", event.target.value)} className={inputClass}>
                <option value="regular">Regular</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
              {errors.role && <span className="mt-1 block text-xs text-red-600">{errors.role}</span>}
            </label>

            <label className="block text-sm font-medium text-gray-700">
              <span className="mb-1.5 block">Position</span>
              <select value={form.positions_id} onChange={(event) => setField("positions_id", event.target.value)} className={inputClass}>
                <option value="">No position</option>
                {positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-700">
              <span className="mb-1.5 block">Status</span>
              <select value={form.status} onChange={(event) => setField("status", event.target.value)} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            {field("address", "Address")}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMembersForm;
