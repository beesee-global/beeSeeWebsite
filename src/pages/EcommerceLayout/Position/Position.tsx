import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Settings2, Trash2, X } from "lucide-react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import AlertDialog from "../../../components/feedback/AlertDialog";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import { userAuth } from "../../../hooks/userAuth";
import { hasModulePermission } from "../../../utils/modulePermissions";
import { fetchEcommercePositions, createEcommercePosition, updateEcommercePosition, deleteEcommercePosition } from "../../../services/Ecommerce/positionServices";
import type { EcommercePosition } from "../../../services/Ecommerce/userServices";

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#d9ad00] focus:ring-1 focus:ring-[#d9ad00]";

const Position = () => {
  const { userInfo, snackBarMessage, snackBarType, snackBarOpen, setSnackBarMessage, setSnackBarType, setSnackBarOpen } = userAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [editing, setEditing] = useState<EcommercePosition | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: positions = [], isLoading, isError } = useQuery<EcommercePosition[]>({
    queryKey: ["ecommerce-positions"],
    queryFn: fetchEcommercePositions,
  });

  const canAdd = hasModulePermission(userInfo, "users", "position", "add");
  const canEdit = hasModulePermission(userInfo, "users", "position", "edit");
  const canDelete = hasModulePermission(userInfo, "users", "position", "delete");
  const selected = useMemo(() => positions.find((position) => String(position.id) === String(selectedId)), [positions, selectedId]);

  const saveMutation = useMutation({
    mutationFn: () => editing
      ? updateEcommercePosition({ id: editing.id, ...form, permissions: editing.permissions })
      : createEcommercePosition(form),
  });
  const deleteMutation = useMutation({ mutationFn: deleteEcommercePosition });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
  };

  const openEdit = () => {
    if (!selected || !canEdit) return;
    setEditing(selected);
    setForm({ name: selected.name || "", description: selected.description || "" });
  };

  const closeForm = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || (!editing && !canAdd)) return;
    try {
      await saveMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ["ecommerce-positions"] });
      closeForm();
      setSnackBarType("success");
      setSnackBarMessage(editing ? "Position updated successfully." : "Position created successfully.");
      setSnackBarOpen(true);
    } catch (error: any) {
      setSnackBarType("error");
      setSnackBarMessage(error?.response?.data?.message || "Unable to save position.");
      setSnackBarOpen(true);
    }
  };

  const remove = async () => {
    if (!selected || !canDelete) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      await queryClient.invalidateQueries({ queryKey: ["ecommerce-positions"] });
      setSelectedId(null);
      setDialogOpen(false);
      setSnackBarType("success");
      setSnackBarMessage("Position deleted successfully.");
      setSnackBarOpen(true);
    } catch (error: any) {
      setDialogOpen(false);
      setSnackBarType("error");
      setSnackBarMessage(error?.response?.data?.message || "Unable to delete position.");
      setSnackBarOpen(true);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <SnackbarTechnician open={snackBarOpen} type={snackBarType} message={snackBarMessage} onClose={() => setSnackBarOpen(false)} />
      <AlertDialog open={dialogOpen} title="Delete position" message="This action cannot be undone. Continue?" onClose={() => setDialogOpen(false)} onSubmit={remove} />
      <Breadcrumb items={[{ label: "Position", isActive: true, icon: <Settings2 className="h-4 w-4" /> }]} />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ecommerce Positions</h1>
            <p className="mt-1 text-sm text-gray-500">Manage positions used by ecommerce team members.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAdd && <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#FCD000] px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-[#e9c000]"><Plus className="h-4 w-4" /> Add Position</button>}
            {canEdit && <button type="button" onClick={openEdit} disabled={!selected} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Pencil className="h-4 w-4" /> Edit</button>}
            {canDelete && <button type="button" onClick={() => setDialogOpen(true)} disabled={!selected || deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button>}
          </div>
        </div>

        {(canAdd || editing) && (form.name || editing === null) && (
          <form onSubmit={save} className="mt-6 grid gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <label className="text-sm font-medium text-gray-700">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`${inputClass} mt-1.5`} required /></label>
            <label className="text-sm font-medium text-gray-700">Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} mt-1.5`} /></label>
            <div className="flex gap-2"><button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save</button><button type="button" onClick={closeForm} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"><X className="h-4 w-4" /> Cancel</button></div>
          </form>
        )}

        <div className="mt-6 overflow-x-auto">
          {isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading positions...</p> : isError ? <p className="py-12 text-center text-sm text-red-600">Positions could not be loaded.</p> : positions.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">No positions found.</p> : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Description</th><th className="px-3 py-3">Protected</th></tr></thead>
              <tbody className="divide-y divide-gray-100">{positions.map((position) => <tr key={position.id} onClick={() => setSelectedId(position.id)} className={`cursor-pointer ${String(selectedId) === String(position.id) ? "bg-amber-50" : "hover:bg-gray-50"}`}><td className="px-3 py-4 font-medium text-gray-900">{position.name}</td><td className="px-3 py-4 text-gray-600">{position.description || "—"}</td><td className="px-3 py-4 text-gray-600">{position.is_protected ? "Yes" : "No"}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Position;
