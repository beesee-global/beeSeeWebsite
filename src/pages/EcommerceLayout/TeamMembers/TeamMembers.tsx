import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import { deleteEcommerceUsers, fetchEcommerceUsers, type EcommerceUser } from "../../../services/Ecommerce/userServices";
import { hasModulePermission } from "../../../utils/modulePermissions";
import { userAuth } from "../../../hooks/userAuth";
import AlertDialog from "../../../components/feedback/AlertDialog";
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";

const TeamMembers = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { userInfo, snackBarMessage, snackBarType, snackBarOpen, setSnackBarMessage, setSnackBarType, setSnackBarOpen } = userAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: membersResponse = [], isLoading, isError } = useQuery<EcommerceUser[]>({
    queryKey: ["ecommerce-users"],
    queryFn: fetchEcommerceUsers,
  });

  const canAdd = hasModulePermission(userInfo, "users", "list_user", "add");
  const canEdit = hasModulePermission(userInfo, "users", "list_user", "edit");
  const canDelete = hasModulePermission(userInfo, "users", "list_user", "delete");
  const deleteMutation = useMutation({ mutationFn: deleteEcommerceUsers });

  const members = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return membersResponse;
    return membersResponse.filter((member) =>
      [member.first_name, member.last_name, member.email, member.role, member.position, member.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [membersResponse, search]);

  const selectedMember = members.find((member) => String(member.id) === String(selectedId));

  const handleDelete = async () => {
    if (!selectedMember || !canDelete) return;
    try {
      await deleteMutation.mutateAsync([selectedMember.id]);
      await queryClient.invalidateQueries({ queryKey: ["ecommerce-users"] });
      setSelectedId(null);
      setDialogOpen(false);
      setSnackBarType("success");
      setSnackBarMessage("Team member deleted successfully.");
      setSnackBarOpen(true);
    } catch (error: any) {
      setSnackBarType("error");
      setSnackBarMessage(error?.response?.data?.message || "Unable to delete team member.");
      setSnackBarOpen(true);
    }
  };

  return (
    <div className="min-h-full bg-white p-4 sm:p-6">
      <SnackbarTechnician open={snackBarOpen} type={snackBarType} message={snackBarMessage} onClose={() => setSnackBarOpen(false)} />
      <AlertDialog
        open={dialogOpen}
        title="Delete team member"
        message="This will disable the selected ecommerce account. Continue?"
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDelete}
      />
      <Breadcrumb items={[{ label: "Team Members", isActive: true, icon: <UsersRound className="h-4 w-4" /> }]} />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-1 text-sm text-gray-500">View the people who can access the ecommerce panel.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {canAdd && (
              <button type="button" onClick={() => navigate("/beesee/ecommerce/team-members/form")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FCD000] px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-[#e9c000]">
                <Plus className="h-4 w-4" /> Add User
              </button>
            )}
            {canEdit && (
              <button type="button" disabled={!selectedMember} onClick={() => selectedMember && navigate(`/beesee/ecommerce/team-members/form/${selectedMember.id}`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Pencil className="h-4 w-4" /> Edit
              </button>
            )}
            {canDelete && (
              <button type="button" disabled={!selectedMember || deleteMutation.isPending} onClick={() => setDialogOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team members"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#d9ad00] focus:ring-1 focus:ring-[#d9ad00]"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-gray-500">Loading team members...</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-red-600">Team members could not be loaded.</p>
          ) : members.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No team members found.</p>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Position</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} onClick={() => setSelectedId(member.id)} className={`cursor-pointer ${String(selectedId) === String(member.id) ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                    <td className="px-3 py-4 font-medium text-gray-900">{[member.first_name, member.last_name].filter(Boolean).join(" ") || "Unnamed member"}</td>
                    <td className="px-3 py-4 text-gray-600">{member.email || "—"}</td>
                    <td className="px-3 py-4 capitalize text-gray-600">{member.role || "—"}</td>
                    <td className="px-3 py-4 text-gray-600">{member.position || "—"}</td>
                    <td className="px-3 py-4 text-gray-600">{member.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
