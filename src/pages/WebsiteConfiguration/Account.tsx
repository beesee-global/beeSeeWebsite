import React, { useEffect, useState } from "react";
import { Save, User } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { userAuth } from "../../hooks/userAuth";
import {
  fetchWebsiteConfigurationUserById,
  updateWebsiteConfigurationUser,
} from "../../services/WebsiteConfiguration/websiteConfigurationUserServices";

interface AccountForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

const WebsiteConfigurationAccount = () => {
  const navigate = useNavigate();
  const { userInfo, updateUserSession, setSnackBarMessage, setSnackBarType, setSnackBarOpen } = userAuth();
  const id = userInfo?.id;
  const [form, setForm] = useState<AccountForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: userInfo?.role || "regular",
    status: userInfo?.status || "Active",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["website-configuration-account", id],
    queryFn: () => fetchWebsiteConfigurationUserById(String(id)),
    enabled: id !== undefined && id !== null,
  });

  useEffect(() => {
    const account = data?.data ?? data;
    if (!account) return;
    setForm((current) => ({
      ...current,
      first_name: account.first_name || "",
      last_name: account.last_name || "",
      email: account.email || "",
      role: account.role || current.role,
      status: account.status || current.status,
    }));
  }, [data]);

  const { mutateAsync: saveAccount, isPending } = useMutation({
    mutationFn: () => updateWebsiteConfigurationUser({
      id: String(id),
      userData: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        status: form.status,
        ...(form.password ? { password: form.password } : {}),
      },
    }),
  });

  const updateField = (field: keyof AccountForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await saveAccount();
      updateUserSession({
        email: form.email,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        role: form.role,
        status: form.status,
      });
      setForm((current) => ({ ...current, password: "" }));
      setSnackBarMessage("Account information updated successfully.");
      setSnackBarType("success");
      setSnackBarOpen(true);
    } catch {
      setSnackBarMessage("Unable to update account information.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading account...</div>;

  return (
    <section className="min-h-full bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-yellow-100 p-3 text-yellow-700"><User size={22} /></div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Account</h1>
            <p className="text-sm text-gray-500">Manage your website configuration account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {(["first_name", "last_name", "email"] as const).map((field) => (
            <label key={field} className={field === "email" ? "sm:col-span-2" : ""}>
              <span className="mb-1 block text-sm font-medium text-gray-700">{field.replace("_", " ")}</span>
              <input
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-yellow-500"
                required
              />
            </label>
          ))}
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-700">New password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-yellow-500"
              placeholder="Leave blank to keep the current password"
            />
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => navigate("/beesee/website-configuration/dashboard")} className="rounded-md border px-4 py-2 text-gray-700">Cancel</button>
            <button type="submit" disabled={isPending || !id} className="flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 font-semibold text-gray-900 disabled:opacity-60">
              <Save size={17} /> {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default WebsiteConfigurationAccount;
