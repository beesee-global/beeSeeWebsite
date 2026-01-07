import { useState } from 'react';
import {  
  Trash2, 
  Edit3, 
  Package, 
  Home,
  Layers2,
  Plus,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { fetchAllBanners, deleteBanner } from '../../../../services/Ecommerce/bannerServices'
import {     
  useMutation, 
  useQuery, 
  useQueryClient 
} from '@tanstack/react-query';
import { AlertColor } from '@mui/material';
import AlertDialog from '../../../../components/feedback/AlertDialog';
import Snackbar from '../../../../components/feedback/Snackbar';

const BannerManager = () => {
  const navigate = useNavigate(); 

  // refetch the journey list when deleted
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<string>('');
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | string>(0);
  const [title, setTitle] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { data: bannersResponse } = useQuery({
    queryKey: ['banners'],
    queryFn: () => fetchAllBanners(),
  });

  const banners = bannersResponse || [];

    // --- form editing information ---
  const handleRowEdit = (id: number | string) => {
      navigate(`/beesee/manage-banner/form/${id}`);
  };

    // --- asking if delete information ---
  const handleVerifyDelete = (id: number | string) => {
      setDeleteId(id);
      setOpenModal(true);
      setTitle('Delete Banner Item Confirmation');
      setMessage(`This action cannot be undone. Are you sure you want to delete this banner item?`);
  };
 
  // --- close modal ---
  const handleCloseModal = () => {
      setOpenModal(false);
      setDeleteId(0);
      setTitle('');
      setMessage('');
  };

  const handleDeleteRow = async () => {
    try {
        await deleteBanner(deleteId);
        setSnackBarType("success");
        setMessage("The banner has been deleted successfully.");

        // ✅ triggers refetch
        queryClient.invalidateQueries(["banners"])
    } catch (error) {
        setSnackBarType("error");
        setMessage("Failed to delete the banner. Please try again.");
    } finally {
        setOpenModal(false);
        setShowAlert(true);
        setDeleteId(0);
        setTitle("");
    }
};
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className='w-full mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Modal Component */}
        <AlertDialog
            open={openModal}
            title={title}
            message={message}
            onClose={handleCloseModal}
            onSubmit={handleDeleteRow}
            isLoading={false}
        />

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
              { label: 'Banner', isActive: true, icon: <Layers2 className="w-4 h-4" /> },
            ]}
          />  
        </div>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                Manage Banner
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Upload, arrange, and schedule homepage banners
              </p>
            </div>
            <button
              onClick={() => navigate("/beesee/manage-banner/form")}
              className='flex items-center px-6 py-3 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold'
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Banner
            </button>
          </div>
        </div>

        {/* Banner Cards */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            {banners.length === 0 ?  (
              <div className='bg-white rounded-xl shadow-sm border-gray-200 p-12 text-center'>
                <Layers2 className='mx-auto h-12 w-12 text-gray-400 mb-4'/>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No banners yet
                </h3>
                <p className='text-gray-600 mb-6'>
                  Start adding banners
                </p>
                <button 
                  onClick={() => navigate("/beesee/manage-banner/form")}
                  className='inline-flex items-center px-4 py-2 bg-gradient-to-tr  from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-semibold'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add First Banner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((product, index) => (
                  <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                  >
                      {/* Image Container */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                      {product.image_url ? (
                          <motion.img
                          src={product.image_url}
                          alt={product.title}
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
                          onClick={() => handleRowEdit(product.pid)}
                          className="p-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                          title="Edit product"
                          >
                          <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVerifyDelete(product.id)}
                            className="p-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                            title="Delete product"
                          >
                          <Trash2 className="w-4 h-4" />
                          </motion.button>
                      </div>

                      {/* Optional: Status Badge */}
                      {product.start_date && (
                          <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full shadow-sm">
                              <Calendar className="w-3 h-3" />
                              {`${new Date(product.start_date).toLocaleDateString()} - ${new Date(product.end_date).toLocaleDateString()}`}
                          </span>
                          </div>
                      )}
                      </div>

                      {/* Content Container */}
                      <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.title}
                      </h3>
 
                      {/* Footer Actions (Always Visible on Mobile) */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 sm:hidden">
                          <button
                          onClick={() => handleRowEdit(product.pid)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
                          >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                          </button>
                          <button
                          onClick={() => handleVerifyDelete(product.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                          >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
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

export default BannerManager;
