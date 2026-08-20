import {
  Home,
  Package,
  Tag,
} from 'lucide-react'  
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import { fetchAllProduct } from '../../../services/Ecommerce/productServices'
import { fetchAllCategory } from '../../../services/Ecommerce/categoryServices'
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const items = [
    { label: "Home", isActive: true, icon: <Home className="w-4 h-4"/> }
  ];
  
  const { data: productResponse, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ["product"],
    queryFn: fetchAllProduct,
  });

  const { data: categoryResponse, isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["category"],
    queryFn: fetchAllCategory,
  });

  const totalProducts = Array.isArray(productResponse)
    ? productResponse.length
    : Array.isArray(productResponse?.data)
      ? productResponse.data.length
      : 0;
  const totalCategories = Array.isArray(categoryResponse)
    ? categoryResponse.length
    : Array.isArray(categoryResponse?.data)
      ? categoryResponse.data.length
      : 0;

  return (
    <div className="min-h-full bg-slate-50 py-6 sm:py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={items}/>
        </div>

        {/* header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                Dashboard
              </h1>
              <p className="text-slate-500">
                Overview of inquiries and project status
              </p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Products</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {productsLoading ? "..." : productsError ? "-" : totalProducts}
                </p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Categories</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {categoriesLoading ? "..." : categoriesError ? "-" : totalCategories}
                </p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <Tag className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard

