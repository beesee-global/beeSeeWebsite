import { useState, useMemo, useEffect } from "react";   
import Breadcrumb from "../../../components/Navigation/Breadcrumbs";
import TableInbox from "./components/TableInbox";
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import { useNavigate } from "react-router-dom"; 
import SnackbarTechnician from "../../../components/feedback/SnackbarTechnician";
import { userAuth } from '../../../hooks/userAuth'
import AlertDialog from "../../../components/feedback/AlertDialog";
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import styles from '../../../assets/css/BackOfficeStyles.css';
import {
  fetchDeviceType,
  fetchOpen,
  fetchResolve,
  deleteTickets,
  fetchOngoing,
  searchJobOrder,
  fetchClosed
} from '../../../services/Technician/ticketsServices'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WorkIcon from '@mui/icons-material/Work';
import { io } from 'socket.io-client' 
import { Send } from 'lucide-react'

const Home = () => { 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [organization, setOrganization] = useState<string>("all"); 
  const [searchValue, setSearchValue] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen , setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const { 
    userInfo, 
    setSnackBarMessage,  
    setSnackBarOpen,
    setSnackBarType,
    setStatusFilter, 
    statusFilter,
  } = userAuth();

  let columns: any = [];

  // filter columns based on status - ongoing and pending have same columns, resolved and closed have same columns (can be different from ongoing/pending)
  if (statusFilter === "Pending" || statusFilter === "Ongoing") {
    columns = [
      { id: 'full_name', label: 'Full Name', sortable: true},
      { id: 'reference_number', label: 'Job No.', sortable: true },
      { id: 'company', label: 'Company / Institution Name', sortable: true }, 
      { id: 'device_type', label: "Device Type", sortable: true },
      { id: "issue_type", label: "Model Type", sortable: true },
      { id: "issue_name", label: "Issue Type", sortable: true }, 
      { id: 'status_date', label: 'Date Created', sortable: false },
    /*  { id: 'actions', label: '', sortable: false, width: 'w-24', align: 'right' }, */
    ]
  } else {
    columns = [
      { id: 'full_name', label: 'Full Name', sortable: true},
      { id: 'reference_number', label: 'Job No.', sortable: true },
      { id: 'company', label: 'Company / Institution Name', sortable: true }, 
      { id: 'device_type', label: "Device Type", sortable: true },
      { id: "issue_type", label: "Model Type", sortable: true },
      { id: "issue_name", label: "Issue Type", sortable: true }, 
      { id: 'status_date', label: 'Date Completed', sortable: false },
    /*  { id: 'actions', label: '', sortable: false, width: 'w-24', align: 'right' }, */
    ]
  }

  const jobOrderPermission = userInfo?.permissions?.find(p => p.parent_id === 'job-order' && p.children_id === '');

  const { data: openTicketResponse = [], isLoading: openLoading } = useQuery ({
    queryKey: ['open-ticket'],
    queryFn: fetchOpen,
  });

  const { data: resolvedTicketResponse = [], isLoading: resolveLoading } = useQuery ({
    queryKey: ['resolve-ticket'],
    queryFn: fetchResolve
  });

  const { data: ongoingTicketResponse} = useQuery ({
    queryKey: ['ongoing-ticket'],
    queryFn: fetchOngoing
  });

  const { data: closedTicketResponse } = useQuery ({
    queryKey: ['closed-ticket'],
    queryFn: fetchClosed
  })

  const { data: listOfTicket } = useQuery({
    queryKey: ['listOfTicket'],
    queryFn: searchJobOrder
  }); 

  const { data: allDeviceResponse = [], isLoading: companyLoading } = useQuery ({
    queryKey: ['client-open'],
    queryFn: fetchDeviceType,
    select: (res) => [
      { value: 'all', label: 'All' }, // first element
      ...res.data.map((item: any) => ({
        value: item.name,
        label: item.name
      }))
    ]
  });
 
  const { mutateAsync: deleteTicket } = useMutation({
    mutationFn: deleteTickets
  });

  // list of search (reference numbers only)
  const listTicketNumber = useMemo(() => {
    return Array.from(
      new Set(
        (listOfTicket?.data || [])
          .map((item: any) => String(item?.reference_number || ""))
          .filter(Boolean)
      )
    );
  }, [listOfTicket]);

  // when user selects a search suggestion, set the search value and filter the table to show the selected ticket's status
  const handleSearchSuggestionSelect = (referenceNumber: string) => {
    setSearchValue(referenceNumber);
    setDebouncedSearch(referenceNumber);

    const selectedTicket = (listOfTicket?.data || []).find(
      (item: any) => String(item?.reference_number) === referenceNumber
    );

    const status = String(selectedTicket?.status || "").toLowerCase();
    if (status === "open" && selectedTicket?.is_closed === 0) setStatusFilter("Pending");
    if (status === "ongoing" && selectedTicket?.is_closed === 0) setStatusFilter("Ongoing");
    if (status === "resolved" && selectedTicket?.is_closed === 0) setStatusFilter("Completed");
    if (selectedTicket?.is_closed) setStatusFilter("Closed");
  };
  // ⭐ SELECT WHICH ROWS TO USE - Filter by status
  const rows = useMemo(() => {
    let baseRows = [];
    if (statusFilter === "Pending") baseRows = openTicketResponse?.data || [];
    if (statusFilter === "Ongoing") baseRows = ongoingTicketResponse?.data || [];
    if (statusFilter === "Completed") baseRows = resolvedTicketResponse?.data || [];
    if (statusFilter === "Closed") baseRows = closedTicketResponse?.data || [];
    
    // Filter by organization/company if selected (not "all")
    if (organization && organization !== "all") {
      return baseRows.filter((row: any) => row.device_type === organization);
    }
    
    return baseRows;
  }, [
    organization,
    statusFilter,
    openTicketResponse,
    ongoingTicketResponse,
    closedTicketResponse,
    resolvedTicketResponse, 
  ]);

  // listing job orders by status for easy access when user selects a search suggestion (instead of filtering the entire list again, we can just show the relevant list based on status)
  const listOfJobOrder = {
    "Pending": openTicketResponse?.data || [],
    "Ongoing": ongoingTicketResponse?.data || [],
    "Completed": resolvedTicketResponse?.data || [],
    "Closed": closedTicketResponse?.data || []
  }
 
  const handleEdit = (pid: number) => { 
    navigate(`/beesee/job-order/conversation/${pid}`)
  };

  const handleDelete = (ids: number[]) => {
    
    if (!jobOrderPermission || !jobOrderPermission.actions.includes('delete')) {
      setSnackBarMessage("You do not have permission to delete Job Order.")
      setSnackBarType("error")
      setSnackBarOpen(true)
      return
    } 

    setDeleteIds(ids)
    setDialogTitle("Confirm Delete")
    setDialogOpen(true)
    setDialogMessage(`Are you sure you want to delete ${ids.length} job order?`)
 
  };

  const handleConfirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(deleteIds));
      const response = await deleteTicket(formData); // call mutation

      if (response?.success) {
        setDialogOpen(false)
        setDialogMessage('')
        setDialogTitle("")
        setSnackBarMessage("Tickets deleted successfully");
        setSnackBarType("success");
        setSnackBarOpen(true);
 
        // 🔄 Refetch relevant ticket queries
        await queryClient.invalidateQueries({ queryKey: ['open-ticket'] });
        await queryClient.invalidateQueries({ queryKey: ['ongoing-ticket']})
        await queryClient.invalidateQueries({ queryKey: ['client-open'] }); 
      }
    } catch (error) {
      setSnackBarMessage("Failed to delete ticket. Please try again.");
      setSnackBarType("error");
      setSnackBarOpen(true);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL_BACKEND as string, {
      path: "/socket.io/",
      transports: ["polling", "websocket"], // try polling first, then upgrade
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("ticket-updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["open-ticket"] });
      queryClient.invalidateQueries({ queryKey: ['ongoing-ticket'] })
      queryClient.invalidateQueries({ queryKey: ["resolve-ticket"]});
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.off("ticket-updated");
      socket.disconnect();
    };
  }, [queryClient]);
 
  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return rows;
    const search = debouncedSearch.toLowerCase(); 
    return rows.filter((row: any) =>
      row?.reference_number?.toLowerCase().includes(search) ||
      row?.device_type?.toLowerCase().includes(search) ||
      row?.issue_name?.toLowerCase().includes(search) ||
      row?.issue_type?.toLowerCase().includes(search) ||
      row?.company?.toLowerCase().includes(search)
    )
  }, [rows, debouncedSearch])

  const isLoading = openLoading || resolveLoading || companyLoading;

  if (isLoading) {
    return <SpinningRingLoader />
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-10 bg-white"> 

      {/* Dialog */}
      <AlertDialog 
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleConfirmDelete} 
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <Breadcrumb 
            items={[
              { label: "Job Order", isActive: true, icon: <WorkIcon/> },
            ]}
          />
        </div>
        
        {/* Actions - Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          {/* Search Field - Moved first */}
          <div className="w-full sm:w-auto flex-grow">
            <CustomSearchField 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="h-10 sm:h-11 w-full"
              suggestions={listTicketNumber}
              onSuggestionSelect={handleSearchSuggestionSelect}
              maxSuggestions={5}
            />
          </div>
          
          {/* Add Ticket Button - Moved under search */}
          {jobOrderPermission?.actions.includes('add') && 
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap w-full sm:w-auto h-10 sm:h-11 flex-shrink-0"
              onClick={() => navigate('/beesee/job-order/submit-ticket')}
            >
              <Send className='w-4 h-4' />
              <span className="hidden sm:inline">Add Ticket</span>
              <span className="sm:hidden">Add</span>
            </button>
          }
        </div>
      </div>

      {/* Table Section */}
      <TableInbox
        rows={filteredRows}
        columns={columns}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        isLoading={isLoading}
        organization={organization}
        deviceListing={allDeviceResponse}
        setOrganization={setOrganization}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        listOfJobOrder={listOfJobOrder}
      />
    </div>
  );
};

export default Home;
