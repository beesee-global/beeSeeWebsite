import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UsersRound } from "lucide-react";
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import { fetchEcommerceUsers } from "../../../services/Ecommerce/userServices";

type TeamMember = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  position?: string | null;
  status?: string;
};

const TeamMembers = () => {
  const [search, setSearch] = useState("");
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["ecommerce-users"],
    queryFn: fetchEcommerceUsers,
  });

  const members = useMemo(() => {
    const users: TeamMember[] = Array.isArray(response?.data) ? response.data : [];
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((member) =>
      [member.first_name, member.last_name, member.email, member.role, member.position, member.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [response, search]);

  return (
    <div className="min-h-full bg-white p-4 sm:p-6">
      <Breadcrumb items={[{ label: "Team Members", isActive: true, icon: <UsersRound className="h-4 w-4" /> }]} />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-1 text-sm text-gray-500">View the people who can access the ecommerce panel.</p>
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
                  <tr key={member.id}>
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
