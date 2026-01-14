import React, { useState, useEffect, useMemo } from 'react'
import {  
  fetchInquiriesSettled,
  fetchInquiriesUnsettled,
  deleteInquiries, 
} from '../../../services/Technician/inquiriesServices'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query' 
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import TableInquiries from './components/TableInquiries';
import SnackbarTechnician from '../../../components/feedback/SnackbarTechnician';
import AlertDialog from '../../../components/feedback/AlertDialog';
import WorkIcon from '@mui/icons-material/Work';
import CustomSearchField from "../../../components/Fields/CustomSearchField";
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens'
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client' 

const Inquiries = () => { 
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: "company", label: 'Company', sortable: true },
    { id: "position", label: "Position", sortable: true },
    { id: "subject", label: "Subject", sortable: true },
    { id: "description", label: 'Description', sortable: true }, 
  ] 
  
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [statusFilter, setStatusFilter] = useState<string>("Unsettled");

  const { 
    data: inquiriesPendingResponse, 
    isLoading: isPendingLoading, 
    error: pendingError 
  } = useQuery({
    queryKey: ["pending-inquiries"],
    queryFn: fetchInquiriesUnsettled
  });
      
  const { 
    data: inquiriesCompletedResponse, 
    isLoading: isCompletedLoading, 
    error: completedError 
  } = useQuery({
    queryKey: ["completed-inquiries"],
    queryFn: fetchInquiriesSettled
  });

  const rows = useMemo(() => {
    let baseRows = [];

    if (statusFilter === "Unsettled") baseRows = inquiriesPendingResponse?.data || [];
    if (statusFilter === "Settled") baseRows = inquiriesCompletedResponse?.data || [];

    // Remove duplicates based on unique identifier (e.g., id or pid)
    const uniqueRows = Array.from(
      new Map(baseRows.map(item => [item.id, item])).values()
    );

    return uniqueRows;
  }, [statusFilter, inquiriesPendingResponse, inquiriesCompletedResponse])

  // Handle Edit/View Inquiry
  const handleEdit = (pid: string) => {  
    navigate(`/beesee/inquiries/reply/${pid}`)
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const filteredInquiries = useMemo(() => {
    if (!debouncedSearch.trim()) return rows

    return rows.filter((i: any) =>
      i.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [rows, debouncedSearch])

/*   // Export to CSV
  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      setSnackBarMessage('No data to export');
      setSnackBarType('warning');
      setSnackBarOpen(true);
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Contact Number', 'Company', 'Position', 'Solution', 'Description', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...inquiries.map((row: any) => [
        row.name || '',
        row.email || '',
        row.contact_number || '',
        row.company || '',
        row.position || '',
        row.solution || '',
        `"${(row.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
        new Date(row.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackBarMessage('Inquiries exported successfully');
    setSnackBarType('success');
    setSnackBarOpen(true);
  }; */

  const isLoading = isPendingLoading || isCompletedLoading

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL_BACKEND as string, {
      transports: ["websocket"], // avoids 400 Bad Request
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("inquiry-updated", (data) => {
      console.log("New inquiry received:", data);
      queryClient.invalidateQueries({ queryKey: ["pending-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["completed-inquiries"] });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.off("inquiry-updated");
      socket.disconnect();
    };
  }, []);
  
  if (isLoading) return <SpinningRingLoader />

  return (
    <div className="p-6 space-y-10 bg-white"> 

      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <Breadcrumb 
            items={[
              { label: "Job Order", href: "/beesee/job-order", icon: <WorkIcon /> }, 
              { label: "Inquiries", isActive: true, icon: <QuestionAnswerIcon /> }
            ]}
          />
        </div>

        <div>
          <CustomSearchField 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
          />
        </div>
        
        
      </div>

      {/* Table */}
      <TableInquiries 
        columns={columns}
        rows={filteredInquiries}
        handleEdit={handleEdit} 
        isLoading={isLoading}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )
}

export default Inquiries

/* Action Buttons 
        <div className="flex gap-2">
          Export Button 
          <button 
            onClick={handleExportCSV}
            disabled={inquiries.length === 0}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          Stats Badge 
          <div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-semibold text-blue-900">
              Total: {inquiries.length}
            </span>
          </div>
        </div>
        
        */