import { useState } from 'react'
import Breadcrumb from '../../../components/Navigation/Breadcrumbs'
import Snackbar from '../../../components/feedback/Snackbar'
import { AlertColor } from '@mui/material'
import {   
  Home, 
} from 'lucide-react';
import GroupsIcon from '@mui/icons-material/Groups';
import { fetchAllConsultation } from '../../../services/consultationServices';
import { useQuery } from '@tanstack/react-query'
import { X, Calendar } from 'lucide-react'
import ConsultationTable from '../../../components/DataDisplay/ConsultationTable'
import { auto } from '@popperjs/core';

const Consultation = () => {

    const [message, setMessage] = useState<string>('');
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
    const [showAlert, setShowAlert] = useState<boolean>(false); 
    const [title, setTitle] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);

    const { data: inquiriesResponse } = useQuery({
        queryKey: ["consultation"],
        queryFn: () => fetchAllConsultation()
    });

    const columns = [
        { id: 'name', label: 'Name', numeric: false, disablePadding: false },
        { id: 'email', label: 'Email', numeric: false, disablePadding: false },
        { id: 'company', label: 'Company', numeric: false, disablePadding: false }, 
        { id: 'phone', label: 'Phone', numeric: false, disablePadding: false },
        { id: 'solution', label: 'Solution', numeric: false, disablePadding: false },
        { id: 'message', label: 'Message', numeric: false, disablePadding: false }, 
        { id: 'created_at', label: 'Received', numeric: false, disablePadding: false }, 
    ];  


    const [selected, setSelected] = useState<any>(null);
    const [openDetails, setOpenDetails] = useState<boolean>(false);
    // Scheduling state
    const [openScheduler, setOpenScheduler] = useState<boolean>(false);
    const [selectedForSchedule, setSelectedForSchedule] = useState<any>(null);
    const [appointmentDate, setAppointmentDate] = useState<string>('');
    const [scheduleError, setScheduleError] = useState<string>('');

    const openInquiry = (inq: any) => {
        setSelected(inq);
        setOpenDetails(true);
    }

    const openSchedule = (inq: any) => {
        setSelectedForSchedule(inq);
        setAppointmentDate('');
        setScheduleError('');
        setOpenScheduler(true);
    }

    const closeSchedule = () => {
        setSelectedForSchedule(null);
        setAppointmentDate('');
        setScheduleError('');
        setOpenScheduler(false);
    }

    const closeInquiry = () => {
        setSelected(null);
        setOpenDetails(false);
    }

    const handleSetAppointment = () => {
        if (!appointmentDate) {
            setScheduleError('Please select date and time for appointment');
            return;
        }

        // For now just show confirmation — TODO: call scheduling API
        setMessage(`Appointment set for ${new Date(appointmentDate).toLocaleString()}`);
        setSnackBarType('success');
        setShowAlert(true);
        closeSchedule();
    }
    
    return (
        <div className='py-8 bg-gray-50 min-h-screen'>
            <div className='w-full mx-auto px-4 sm:px-6 lg:px-8'> 
                {/* Notification */}
                <Snackbar 
                    open={showAlert}
                    type={snackBarType}
                    message={message}
                    onClose={() => setShowAlert(false)}
                />

                {/* Bread crumb */} 
                <div className='mb-6'>
                <Breadcrumb 
                    items={[
                    { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
                    { label: 'Consultation', isActive: true, icon: <GroupsIcon /> },
                    ]}
                />  
                </div>
                
                {/* Header */}
                <div className='bg-white rounded-xl shadow-sm border-gray-200 p-6 mb-6'> 
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                            <div>
                                    <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                                            Consultation
                                    </h1>
                                    <p className='text-gray-600'>
                                            Schedule, track, and manage your consultation sessions efficiently.
                                    </p>
                            </div>
                    </div>
                </div>

                {/* List / Table */}
                <div className='space-y-6'>
                    {(!inquiriesResponse || inquiriesResponse.length === 0) ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <GroupsIcon sx={{
                                mx: auto,
                                height: 48,
                                width: 48,
                                color: "#9CA3AF",
                                mb: 4
                            }}/>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultations yet</h3>
                            <p className="text-gray-600 dark:text-gray-400">You have no consultation inquiries at the moment.</p>
                        </div>
                    ) : (
                        <ConsultationTable 
                            rows={inquiriesResponse}
                            columns={columns}
                        />
                    )}
                </div>

                {/* Details Modal */}
                {openDetails && selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={closeInquiry} />
                        <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consultation Details</h3>
                                <button onClick={closeInquiry} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <div><strong>Name:</strong> {selected.name}</div>
                                <div><strong>Email:</strong> {selected.email}</div>
                                <div><strong>Company:</strong> {selected.company}</div>
                                <div><strong>Role:</strong> {selected.role}</div>
                                <div><strong>Phone:</strong> {selected.phone}</div>
                                <div><strong>Solution:</strong> {selected.solution || '-'}</div>
                                <div><strong>Message:</strong></div>
                                <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">{selected.message}</div>
                                <div><strong>Received:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
                            </div>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center gap-2">
                                <div className="text-sm text-gray-500">Want to meet? Schedule an appointment</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openSchedule(selected)} className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-md">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Set Appointment
                                    </button>
                                    <button onClick={closeInquiry} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Scheduling Modal */}
                {openScheduler && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={closeSchedule} />
                        <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Set Appointment</h3>
                                <button onClick={closeSchedule} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Scheduling for: <strong>{selectedForSchedule?.name}</strong>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={appointmentDate}
                                        onChange={(e) => { setAppointmentDate(e.target.value); setScheduleError(''); }}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    {scheduleError && <p className="text-red-500 text-sm mt-1">{scheduleError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                                    <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Add any notes for the consultation" />
                                </div>
                            </div>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                <button onClick={closeSchedule} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700">Cancel</button>
                                <button onClick={handleSetAppointment} className="px-4 py-2 rounded bg-gradient-to-r from-green-400 to-green-500 text-white">Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Consultation
