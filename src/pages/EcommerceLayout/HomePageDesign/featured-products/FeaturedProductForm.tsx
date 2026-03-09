import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Navigation/Breadcrumbs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllProduct } from '../../../../services/Ecommerce/productServices';
import { createFeaturedProduct, updateFeaturedProduct, fetchFeaturedById } from '../../../../services/Ecommerce/featureProduct';
import CustomTextField from '../../../../components/Fields/CustomTextField';
import SnackbarTechnician from '../../../../components/feedback/SnackbarTechnician';
import { userAuth } from '../../../../hooks/userAuth';
import { Save, SquarePen, Sparkles, Tag, BarChart3, ImagePlus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface SelectedProductEntry {
  product_id: number | null;
  badges: string[];
  file?: File | null;
  previewUrl?: string;
}

const FeaturedProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { snackBarMessage, snackBarType, snackBarOpen, setSnackBarMessage, setSnackBarType, setSnackBarOpen } = userAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<SelectedProductEntry[]>([
    { product_id: null, badges: ['', '', ''], file: null },
    { product_id: null, badges: ['', '', ''], file: null }
  ]);

  const [techStats, setTechStats] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' }
  ]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const { data: productResponse = [], isLoading } = useQuery({
    queryKey: ['product'],
    queryFn: () => fetchAllProduct()
  });

  const productList = productResponse?.data || productResponse || [];
 
  // load featured data when editing (id present)
  const { data: featuredResponse } = useQuery({
    queryKey: ['featuredById', id],
    queryFn: () => fetchFeaturedById(String(id)),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!featuredResponse) return;
    const payload = featuredResponse?.data || featuredResponse;

    // populate basic fields
    setTitle(payload.title || 'FEATURED PRODUCTS');
    setDescription(payload.description || '');

    // map products
    const mappedProducts: SelectedProductEntry[] = (payload.products || []).map((p: any) => {
      // try to find numeric id from productList by name or id match
      const found = productList.find((pp: any) => String(pp.id) === String(p.id) || pp.name === p.name || String(pp.pid) === String(p.id));
      const product_id = found ? Number(found.id) : null;
      const badges = (p.badges || []).slice(0, 3).map((b: any) => b.text || '') as string[];
      while (badges.length < 3) badges.push('');
      return {
        product_id,
        badges,
        file: null,
        previewUrl: p.imageUrl || undefined,
      };
    });

    // ensure at least 2 product slots
    while (mappedProducts.length < 2) mappedProducts.push({ product_id: null, badges: ['', '', ''], file: null });
    setProducts(mappedProducts.slice(0, Math.max(2, mappedProducts.length)));

    // map techStats
    const mappedStats = (payload.techStats || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((s: any) => ({ label: s.label || '', value: s.value || '' }));
    // ensure 3 stats
    while (mappedStats.length < 3) mappedStats.push({ label: '', value: '' });
    setTechStats(mappedStats.slice(0, 3));
  }, [featuredResponse, productList]);

  const createMutation = useMutation({ 
    mutationFn: createFeaturedProduct, 
    onSuccess: () => {
      setSnackBarType('success');
      setSnackBarMessage('Featured product created successfully');
      setSnackBarOpen(true);
      queryClient.invalidateQueries(['features']);
      navigate('/beesee/ecommerce/feature-product');
    }, 
    onError: (err: any) => {
      setSnackBarType('error');
      setSnackBarMessage('Failed to create featured product');
      setSnackBarOpen(true);
    }
  });

  const updateMutation = useMutation({ 
    mutationFn: ({ id, formData }: any) => updateFeaturedProduct(featuredResponse.id, formData), 
    onSuccess: () => {
      setSnackBarType('success');
      setSnackBarMessage('Featured product updated successfully');
      setSnackBarOpen(true);
      queryClient.invalidateQueries(['features']);
      navigate('/beesee/ecommerce/feature-product');
    }, 
    onError: (err: any) => {
      setSnackBarType('error');
      setSnackBarMessage('Failed to update featured product');
      setSnackBarOpen(true);
    }
  });

  const handleBadgeChange = (index: number, badgeIdx: number, value: string) => {
    setProducts(prev => {
      const copy = [...prev];
      copy[index].badges[badgeIdx] = value;
      return copy;
    });
  };

  const handleProductSelect = (index: number, value: string) => {
    setProducts(prev => {
      const copy = [...prev];
      copy[index].product_id = value ? Number(value) : null;
      return copy;
    });
  };

  const handleFileChange = (index: number, file?: File | null) => {
    setProducts(prev => {
      const copy = [...prev];
      copy[index].file = file || null;
      
      // Create preview URL
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        copy[index].previewUrl = previewUrl;
      } else {
        copy[index].previewUrl = undefined;
      }
      
      return copy;
    });
  };

  const handleTechStatChange = (i: number, key: 'label' | 'value', val: string) => {
    setTechStats(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: val };
      return copy;
    });
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageUrl('');
  };

  const buildAndSubmit = async () => {
    try {
      const productsPayload = products
        .filter(p => p.product_id !== null)
        .map(p => ({ product_id: p.product_id, badges: p.badges.filter(Boolean).map(t => ({ text: t })) }));

      const productsString = JSON.stringify(productsPayload);
      const techStatsString = JSON.stringify(techStats);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('products', productsString);
      formData.append('techStats', techStatsString);

      products.forEach((p) => {
        if (p.product_id) {
            // Send new file if present
            if (p.file) {
                formData.append(`gallery[${p.product_id}]`, p.file as File);
            }
            
            // Always send existing image URL if no new file
            if (!p.file && p.previewUrl) {
                formData.append(`existingGallery[${p.product_id}]`, p.previewUrl);
            }
        }
    });


      if (id) {
        await updateMutation.mutateAsync({ id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error: any) {
      setSnackBarType('error');
      setSnackBarMessage('Submission failed');
      setSnackBarOpen(true);
    }
  };

  const getSelectedProductName = (productId: number | null) => {
    if (!productId) return null;
    const product = productList.find((p: any) => p.id === productId);
    return product?.name || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SnackbarTechnician 
          open={snackBarOpen} 
          type={snackBarType as any} 
          message={snackBarMessage} 
          onClose={() => setSnackBarOpen(false)} 
        />

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[ 
              { label: 'Home Page Design', href: '/beesee/ecommerce/homepage' }, 
              { label: 'Featured Products', isActive: true } 
            ]} 
          />
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3  bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90
                                hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {id ? 'Update Featured Products' : 'Create Featured Products'}
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Configure featured products with badges, tech stats and gallery images
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/beesee/ecommerce/feature-product')}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={buildAndSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FCD000] to-[#FCD000]/90 hover:from-[#FCD000]/90 hover:to-[#FCD000] text-gray-900 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {id ? 'Update Changes' : 'Create Featured'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <SquarePen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Title
                  </label>
                  <CustomTextField 
                    name="title" 
                    value={title} 
                    onChange={(e:any) => setTitle(e.target.value)} 
                    placeholder="e.g., FEATURED PRODUCTS" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <CustomTextField 
                    name="description" 
                    value={description} 
                    onChange={(e:any) => setDescription(e.target.value)} 
                    placeholder="Describe your featured products section..." 
                    multiline={true} 
                    rows={4} 
                  />
                </div>
              </div>
            </div>

            {/* Products & Badges Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Products & Badges</h3>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 font-medium">2 Products Required</span>
              </div>

              <div className="space-y-4">
                {products.map((p, idx) => (
                  <div 
                    key={idx} 
                    className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 bg-gray-50/50 dark:bg-gray-900/50"
                  >

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Product {idx + 1}
                      </label>
                      <select 
                        value={p.product_id ?? ''} 
                        onChange={(e) => handleProductSelect(idx, e.target.value)} 
                        className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">-- Select a product --</option>
                        {productList.map((prod: any) => (
                          <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Badges */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Product Badges
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {p.badges.map((b, bi) => (
                          <input 
                            key={bi} 
                            value={b} 
                            onChange={(e) => handleBadgeChange(idx, bi, e.target.value)} 
                            placeholder={`Badge ${bi+1}`} 
                            className="p-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Gallery Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Gallery Image
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors bg-white dark:bg-gray-800">
                            <ImagePlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {p.file ? p.file.name : 'Choose image...'}
                            </span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(idx, e.target.files ? e.target.files[0] : undefined)}
                            className="hidden"
                          />
                        </label>
                        
                        {/* Image Preview */}
                        {p.previewUrl && (
                          <div 
                            onClick={() => openImageModal(p.previewUrl!)}
                            className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:scale-105"
                            title="Click to view full image"
                          >
                            <img 
                              src={p.previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected product indicator */}
                    {p.product_id && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{getSelectedProductName(p.product_id)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tech Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tech Stats</h3>
                <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 font-medium">3 Stats Required</span>
              </div>

              <div className="space-y-3">
                {techStats.map((t, i) => (
                  <div key={i} className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    
                    <div className="space-y-2">
                      <input 
                        value={t.label} 
                        onChange={(e) => handleTechStatChange(i, 'label', e.target.value)} 
                        placeholder="Label (e.g., PROCESSING)"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input 
                        value={t.value} 
                        onChange={(e) => handleTechStatChange(i, 'value', e.target.value)} 
                        placeholder="Value (e.g., HIGH-PERFORMANCE)"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> Tech stats highlight key features of your products
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {imageModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeImageModal}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image */}
              <div 
                className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={selectedImageUrl} 
                  alt="Full preview" 
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturedProductForm;