import React, { useState, useMemo } from 'react';
import CustomSelectField from '../../../components/Fields/CustomSelectField';
import { useNavigate } from 'react-router-dom';
import { 
    useMutation, 
    useQuery, 
    useQueryClient 
} from '@tanstack/react-query';
import { AlertColor } from '@mui/material/Alert';
import { 
    Home, 
    User, 
    Plus,  
    User2,  
} from 'lucide-react'; 

import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import EmployeeTable from '../../../components/DataDisplay/EmployeeTable'; 
import AlertDialog from '../../../components/feedback/AlertDialog';
import Snackbar from '../../../components/feedback/Snackbar';
import { deleteEmployee, fetchEmployees, countEmployee } from '../../../services/Ecommerce/employeeServices';

interface Employee {
    id: number;
    name: string;
    category: string;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    image?: string;
    role?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

const Employee = () => {
    const navigate = useNavigate(); 
    const [filterStatus, setFilterStatus] = useState<string>('all');  
    const [message, setMessage] = useState("");
    const [snackBarType, setSnackBarType] = useState<AlertColor>("success");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number | string>(0);
    const [title, setTitle] = useState<string>("");
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [filterPosition, setFilterPosition] = useState<string>("all")

    const columns = [
        { id: 'email', label: 'Email', numeric: false, disablePadding: false },
        { id: 'phone', label: 'Contact number', numeric: false, disablePadding: false },
        { id: 'address', label: 'Address', numeric: false, disablePadding: false }, 
    ];

    // --- asking if delete information ---
    const handleVerifyDelete = (id: number | string) => {  
        setDeleteId(id)
        setOpenModal(true)
        setTitle("Delete Employee Confirmation");
        setMessage(`This action cannot be undone. Are you sure you want to delete this employee?`);
    }

    // --- form editing information ---
    const handleRowEdit = (id: number | string) => { 
        navigate(`/beesee/employee/form/${id}`)
    }

    // --- close modal ---
    const handleCloseModal = () => {
        setOpenModal(false)
        setDeleteId(0)
        setTitle("")
        setMessage("")
    }

    // --- pass data on api ---
    const { 
        mutateAsync: deleteEmployeeAsync, 
        isPending
    } = useMutation({
        mutationFn: deleteEmployee,
    });

    // fetch all data
    const {
        data: userInfoResponse
    } = useQuery({
        queryKey: ["employee"],
        queryFn: () => fetchEmployees()
    });

    // fetch all count Data
    const {
        data: countData
    } = useQuery<Employee[]>({
        queryKey: ["count"],
        queryFn: () => countEmployee()
    }); 

    // Extract the array safely
    const userInfo = userInfoResponse || []; // <-- this is now Row[]

    // Refetch the employee list when deleted
    const queryClient = useQueryClient();

    const handleDeleteRow = async () => {
        try {
            await deleteEmployeeAsync(deleteId);
            setSnackBarType("success");
            setMessage("The Employee has been disable successfully.");

            // ✅ triggers refetch
            queryClient.invalidateQueries(["employee"])
        } catch (error) {
            setSnackBarType("error");
            setMessage("Failed to delete the Employee. Please try again.");
        } finally {
            setOpenModal(false);
            setShowAlert(true);
            setDeleteId(0);
            setTitle("");
        }
    }; 

    const filteredEmployees = useMemo(() => {
        let result = userInfo;
        
        // Filter by status
        if (filterStatus !== "all") {
            result = (result as Employee[]).filter((emp: Employee) => 
                emp.status.toLowerCase() === filterStatus
            );
        }
        
        // Filter by position
        if (filterPosition !== "all") {
            result = (result as Employee[]).filter((emp: Employee) => 
                (emp.role || '').toLowerCase() === filterPosition.toLowerCase()
            );
        }
        
        return result;
    }, [userInfo, filterStatus, filterPosition])
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Modal Component */}
                <AlertDialog 
                    open={openModal}
                    title={title}
                    message={message}
                    onClose={handleCloseModal}
                    onSubmit={handleDeleteRow}
                    isLoading={isPending}
                />

                {/* Notification */} 
                <Snackbar 
                    open={showAlert}
                    type={snackBarType}
                    message={message}
                    onClose={() => setShowAlert(false)}
                />

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Breadcrumb
                        items={[
                            { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
                            { label: 'Employee ', isActive: true, icon: <User2 className="w-4 h-4" /> },
                        ]}
                    />
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Employee
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your employee
                            </p>
                        </div>
                        
                        <button
                            onClick={() => navigate('/beesee/employee/form')}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employee</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.total ?? 0}</p>
                            </div>
                        </div>
                    </div> 

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <User2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Employee</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.active ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <User2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Employee</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{countData?.inactive ?? 0}</p>
                            </div>
                        </div>
                    </div>

                </div> 

                {/* Filters and Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1"> 
                            <div className="md:flex gap-3"> 
                                <CustomSelectField
                                    name="filterStatus"
                                    placeholder="All Status"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                />

                                <CustomSelectField
                                    name="filterPosition"
                                    placeholder="All Status"
                                    value={filterPosition}
                                    onChange={(e) => setFilterPosition(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Position' },
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'technician', label: 'Technician' },
                                    ]}
                                />
                            </div>
                        </div>
 
                    </div>
                </div>

                {/* if you want to grid view or table */}
                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {filteredEmployees.length === 0 ? (
                        <div className='text-center py-12'>
                            <User2 className='mx-autp h-12 w-12 text-gray-400 mb-4'/>
                            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                                No employee yet
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400 mb-6'>
                                Start adding employee
                            </p>
                            <button
                                onClick={() => navigate('/beesee/employee/form')}
                                className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all'
                            >
                                <Plus className='w-4 h-4 mr-2'/>
                                Add Employee
                            </button>
                        </div>
                    ) : (
                        <EmployeeTable 
                            columns={columns} 
                            handleRowDelete={handleVerifyDelete}
                            handleRowEdit={handleRowEdit}
                            rows={filteredEmployees}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Employee;