import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Plus, Edit3, Trash2, Tag, Zap, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    useMutation, 
    useQuery, 
    useQueryClient 
} from '@tanstack/react-query';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import AlertDialog from '../../../../components/feedback/AlertDialog';
import Snackbar from '../../../../components/feedback/Snackbar';
import CategoryTable from '../../../../components/DataDisplay/CategoryTable';
import { 
    deleteSolution, 
    fetchAllSolutions 
} from '../../../../services/Ecommerce/solutionsOverviewServices';
import { AlertColor } from '@mui/material';

const SolutionsOverview = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [title, setTitle] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const { data: solutionsResponse } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => fetchAllSolutions(),
  });

  const { mutateAsync: deleteSolutionAsync, isPending } = useMutation({
    mutationFn: deleteSolution,
  });

  const solutions = solutionsResponse || [];
  const queryClient = useQueryClient();

  const columns = [
    { id: 'image_url', label: 'Image', numeric: false, disablePadding: false },
    { id: 'title', label: 'Title', numeric: false, disablePadding: false },
    { id: 'description', label: 'Description', numeric: false, disablePadding: false },
  ];

  const rows = solutions.map((s) => ({
    id: s.id,
    pid: s.id,
    image_url: s.image || '',
    title: s.title || '',
    description: s.description || '',
    // keep original payload in case table search needs other fields
    ...s,
  }));

  const handleDeleteRow = async () => {
    try {
      await deleteSolutionAsync(deleteId);
      setSnackBarType('success');
      setMessage('Solution deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
    } catch (error) {
      setSnackBarType('error');
      setMessage('Failed to delete solution. Please try again.');
    } finally {
      setOpenModal(false);
      setShowAlert(true);
      setDeleteId(0);
      setTitle('');
    }
  };

  const handleRowEdit = (id) => {
    navigate(`/beesee/solutions-overview/form/${id}`);
  };

  const handleVerifyDelete = (id) => {
    setDeleteId(id);
    setOpenModal(true);
    setTitle('Delete Solution Confirmation');
    setMessage('This action cannot be undone. Are you sure?');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDeleteId(0);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="w-full mx-auto px-3 sm:px-6 lg:px-8">
        <AlertDialog
          open={openModal}
          title={title}
          message={message}
          onClose={handleCloseModal}
          onSubmit={handleDeleteRow}
          isLoading={isPending}
        />
        <Snackbar
          open={showAlert}
          type={snackBarType}
          message={message}
          onClose={() => setShowAlert(false)}
        />
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/beesee/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Solutions', isActive: true, icon: <Zap className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Solutions Overview
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage enterprise solutions with features and specifications
              </p>
            </div>
            <button
              onClick={() => navigate('/beesee/solutions-overview/form')}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold whitespace-nowrap text-sm sm:text-base transition-all"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              <span>Add Solution</span>
            </button>
          </div>
        </div>
         
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
          {solutions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
              <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No solutions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding enterprise solutions
              </p>
              <button
                onClick={() => navigate('/beesee/solutions-overview/form')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Solution
              </button>
            </div>
          ) : ( 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={solution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      {solution.image_url ? (
                        <motion.img
                          src={solution.image_url}
                          alt={solution.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                          <Package className="w-16 h-16 mb-2 opacity-30" />
                          <span className="text-sm font-medium">No Image</span>
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Action Buttons Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRowEdit(solution.pid)}
                          className="p-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVerifyDelete(solution.id)}
                          className="p-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Optional: Status Badge */}
                      {solution.icon && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full shadow-sm">
                            <Tag className="w-3 h-3" />
                            {solution.icon}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="p-3 sm:p-5">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {solution.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                        {solution.description}
                      </p>

                      {/* Features Preview (if available) */}
                      {solution.features && solution.features.length > 0 && (
                        <div className="mb-3 sm:mb-4 hidden sm:block">
                          <div className="flex flex-wrap gap-1">
                            {solution.features.slice(0, 2).map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-800"
                              >
                                {feature}
                              </span>
                            ))}
                            {solution.features.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md">
                                +{solution.features.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specs Preview (if available) */}
                      {solution.specs && Object.keys(solution.specs).length > 0 && (
                        <div className="space-y-1.5">
                          {Object.entries(solution.specs).slice(0, 2).map(([key, value], idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">{key}:</span>
                              <span className="text-gray-700 dark:text-gray-300 font-semibold">{value}</span>
                            </div>
                          ))}
                          {Object.keys(solution.specs).length > 2 && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
                              +{Object.keys(solution.specs).length - 2} more specs
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer Actions (Always Visible on Mobile) */}
                      <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 sm:hidden">
                        <button
                          onClick={() => handleRowEdit(solution.pid)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleVerifyDelete(solution.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Highlight Bar (appears on hover) */}
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionsOverview;
