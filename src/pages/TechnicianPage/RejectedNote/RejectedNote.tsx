import { useEffect, useMemo, useState } from 'react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../../../components/Navigation/Breadcrumbs';
import TableDefault from '../../../components/DataDisplay/TableDefault';
import ReusableTextFieldModal from '../../../components/feedback/ReusableTextFieldModal';
import AlertDialog from '../../../components/feedback/AlertDialog';
import CustomSearchField from '../../../components/Fields/CustomSearchField';
import { SpinningRingLoader } from '../../../components/ui/LoadingScreens';
import { userAuth } from '../../../hooks/userAuth';
import { InsertRejectedNoted, RejectedNoted, UpdateRejectedNoted } from '../../../models/rejected_note';
import {
    deleteRejectedNotes,
    fetchAllRejectedNotes,
    insertRejectedNotes,
    updateRejectedNotes,
} from '../../../services/Technician/rejectedNotedService';

type RejectedNoteRow = Omit<RejectedNoted, 'id'> & {
    id: number;
};

// Keeps error handling readable while debugging API responses.
const getErrorMessage = (error: any, fallback: string) => {
    return error?.response?.data?.message?.replace(/^Error:\s*/, '') || error?.message || fallback;
};

const RejectedNote = () => {
    const queryClient = useQueryClient();

    // Search state uses the same debounce pattern as Category.tsx.
    const [searchValue, setSearchValue] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    // Dialog state for delete confirmation.
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Modal and selected row state for add/update operations.
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRejectedNote, setSelectedRejectedNote] = useState<RejectedNoteRow | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const {
        userInfo,
        setSnackBarMessage,
        setSnackBarOpen,
        setSnackBarType,
    } = userAuth();

    // Match the Settings > Rejected Note permission configured in the Position modal.
    const Permission = userInfo?.permissions?.find((p) => p.parent_id === 'settings' && p.children_id === 'rejected-note');

    // Fetch rejected notes from the API.
    const { data: rejectedNoteResponse, isLoading } = useQuery({
        queryKey: ['rejected-notes'],
        queryFn: fetchAllRejectedNotes,
    });

    // Normalize response shapes for easier debugging if the backend wrapper changes.
    const rejectedNotes: RejectedNoteRow[] = useMemo(() => {
        const rows = Array.isArray(rejectedNoteResponse)
            ? rejectedNoteResponse
            : rejectedNoteResponse?.data?.data || rejectedNoteResponse?.data || [];

        if (!Array.isArray(rows)) return [];

        return rows.map((note: RejectedNoted) => ({
            ...note,
            id: Number(note.id),
        }));
    }, [rejectedNoteResponse]);

    // CRUD mutations.
    const { mutateAsync: createRejectedNote } = useMutation({
        mutationFn: insertRejectedNotes,
    });

    const { mutateAsync: updateRejectedNote } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateRejectedNoted }) => updateRejectedNotes(id, payload),
    });

    const { mutateAsync: removeRejectedNote } = useMutation({
        mutationFn: deleteRejectedNotes,
    });

    // Table columns are based on rejected_note.ts fields.
    const columns = [
        { id: 'message', label: 'Message', sortable: true, align: 'left' },
        { id: 'created_at', label: '', sortable: false, align: 'right' },
    ];

    // Opens the delete confirmation dialog after validating selection and permission.
    const handleDeleteClick = () => {
        if (!selectedRowId) {
            setSnackBarMessage('Please select a rejected note first');
            setSnackBarType('warning');
            setSnackBarOpen(true);
            return;
        }

        if (!Permission?.actions.includes('delete')) {
            setSnackBarMessage('You do not have permission to delete rejected notes.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        setDeleteId(selectedRowId);
        setDialogTitle('Confirm Delete');
        setDialogOpen(true);
        setDialogMessage('Are you sure you want to delete this rejected note?');
    };

    // Delete selected note and refresh table data.
    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await removeRejectedNote(deleteId);

            if (response?.success) {
                setDialogOpen(false);
                setDialogMessage('');
                setDialogTitle('');
                setDeleteId(null);
                setSelectedRowId(null);
                setSnackBarMessage('Rejected note deleted successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);
                queryClient.invalidateQueries({ queryKey: ['rejected-notes'] });
            }
        } catch (error: any) {
            setSnackBarMessage(getErrorMessage(error, 'Failed to delete rejected note. Please try again.'));
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    // Opens the modal in edit mode for the selected row.
    const handleUpdate = () => {
        if (!selectedRowId) {
            setSnackBarMessage('Please select a rejected note first');
            setSnackBarType('warning');
            setSnackBarOpen(true);
            return;
        }

        if (!Permission?.actions.includes('edit')) {
            setSnackBarMessage('You do not have permission to edit rejected notes.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        const note = rejectedNotes.find((item) => item.id === selectedRowId);
        if (!note) return;

        setSelectedRejectedNote(note);
        setIsEditMode(true);
        setModalOpen(true);
    };

    // Create payload follows InsertRejectedNoted from rejected_note.ts.
    const handleAddRejectedNote = async (formData: Record<string, string>) => {
        try {
            const payload: InsertRejectedNoted = {
                message: formData.message.trim(),
            };

            const response = await createRejectedNote(payload);

            if (response?.success) {
                setSnackBarMessage('Rejected note created successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);
                queryClient.invalidateQueries({ queryKey: ['rejected-notes'] });
            }
        } catch (error: any) {
            setSnackBarMessage(getErrorMessage(error, 'Failed to create rejected note. Please try again.'));
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    // Update payload follows UpdateRejectedNoted from rejected_note.ts.
    const handleUpdateRejectedNote = async (formData: Record<string, string>) => {
        if (!selectedRejectedNote) return;

        try {
            const payload: UpdateRejectedNoted = {
                message: formData.message.trim(),
            };

            const response = await updateRejectedNote({
                id: selectedRejectedNote.id,
                payload,
            });

            if (response?.success) {
                setSnackBarMessage('Rejected note updated successfully');
                setSnackBarType('success');
                setSnackBarOpen(true);
                queryClient.invalidateQueries({ queryKey: ['rejected-notes'] });
                setModalOpen(false);
            }
        } catch (error: any) {
            setSnackBarMessage(getErrorMessage(error, 'Failed to update rejected note. Please try again.'));
            setSnackBarType('error');
            setSnackBarOpen(true);
        }
    };

    // Handle Row Click (Select)
    const handleRowClick = (row: any) => {
        setSelectedRowId(Number(row.id));
    };

    // Handle Row Double Click (Edit)
    const handleRowDoubleClick = (row: any) => {
        if (!Permission?.actions.includes('edit')) {
            setSnackBarMessage('You do not have permission to edit rejected notes.');
            setSnackBarType('error');
            setSnackBarOpen(true);
            return;
        }

        const note = rejectedNotes.find((item) => item.id === Number(row.id));
        if (!note) return;

        setSelectedRejectedNote(note);
        setIsEditMode(true);
        setModalOpen(true);
    };

    // Debounce search input before filtering rows.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchValue]);

    // Filter notes by message.
    const filteredRejectedNotes = useMemo(() => {
        if (!debouncedSearch.trim()) return rejectedNotes;

        return rejectedNotes.filter((note) =>
            note.message.toLowerCase().includes(debouncedSearch.toLowerCase()),
        );
    }, [rejectedNotes, debouncedSearch]);

    const isUpdateEnabled = !!selectedRowId;
    const isDeleteEnabled = !!selectedRowId;

    if (isLoading) return <SpinningRingLoader />;

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

            {/* Modal fields are based on InsertRejectedNoted/UpdateRejectedNoted: message only. */}
            <ReusableTextFieldModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditMode ? 'Edit Rejected Note' : 'Add New Rejected Note'}
                fields={[
                    {
                        name: 'message',
                        placeholder: 'Rejected Note Message',
                        maxLength: '255',
                        type: 'text',
                        multiline: true,
                        rows: 4,
                        value: isEditMode ? selectedRejectedNote?.message || '' : '',
                        validator: (value) => (!value.trim() ? 'Message is required' : undefined),
                    },
                ]}
                onSubmit={isEditMode ? handleUpdateRejectedNote : handleAddRejectedNote}
            />

            {/* Header Section - Responsive layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                {/* Breadcrumb Section */}
                <div className="flex items-center w-full">
                    <Breadcrumb items={[{ label: 'Rejected Note', isActive: true, icon: <FileText /> }]} />
                </div>

                {/* Search and Action Buttons Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
                    {/* Search Field */}
                    <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs">
                        <CustomSearchField
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search by message..."
                            className="w-full"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {/* Add Button */}
                        {Permission?.actions.includes('add') && (
                            <button
                                onClick={() => {
                                    setIsEditMode(false);
                                    setSelectedRejectedNote(null);
                                    setModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm"
                            >
                                <Plus size={18} />
                                <span className="whitespace-nowrap">Add</span>
                            </button>
                        )}

                        {/* Update Button */}
                        {Permission?.actions.includes('edit') && (
                            <button
                                onClick={handleUpdate}
                                disabled={!isUpdateEnabled}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                style={{
                                    background: isUpdateEnabled ? '#15803d' : '#9ca3af',
                                }}
                            >
                                <Pencil size={18} />
                                <span className="whitespace-nowrap">Update</span>
                            </button>
                        )}

                        {/* Delete Button */}
                        {Permission?.actions.includes('delete') && (
                            <button
                                onClick={handleDeleteClick}
                                disabled={!isDeleteEnabled}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                style={{
                                    background: isDeleteEnabled ? '#dc2626' : '#9ca3af',
                                }}
                            >
                                <Trash2 size={18} />
                                <span className="whitespace-nowrap">Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <TableDefault
                rows={filteredRejectedNotes}
                columns={columns}
                isLoading={isLoading}
                selectedRowId={selectedRowId}
                onRowClick={handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                sortable="message"
            />
        </div>
    );
};

export default RejectedNote;
