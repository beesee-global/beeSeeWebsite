import {
  Home,
  Key,
} from 'lucide-react'  
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import PieChart, { PieChartData } from "../../../components/charts/PieChart"
import BarChart from "../../../components/charts/BarChart";
import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchGraph } from '../../../services/Ecommerce/dashboardServices'
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const items = [
    { label: "Home", isActive: true, icon: <Home className="w-4 h-4"/> }
  ];
  
  const {
    data: dashboardResponse,
    isLoading
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchGraph()
  }) 
 
  // pie chart
  const chartData: PieChartData[] = dashboardResponse
    ? Object.entries(dashboardResponse.types).map(([key, value]) => ({
      name: key == "technical_support" ? "Technical Support" : "Request Repair",
      value: Number(value), // convert string to number
    }))
    : [];

  // bar chart
  const categories = dashboardResponse?.categories || [];
  const series = dashboardResponse?.series || [];



  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={items}/>
        </div>

        {/* header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your dashboard
              </p>
            </div>

          </div>
        </div>

        {/* Statistics card */}
        <div className="grid lg:grid-cols-2 mb-6 gap-6">
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 py-5'>
            <PieChart 
              title="Inquiries"
              data={chartData}
              colors={["#36a2eb", "#ffcd56", "#11fa11ff"]}
              donut
            />
          </div>
          <div className='bg-white rounded-xl shadown-sm border border-gray-200 dak:border-gray-700 py-5'>
            <BarChart
              title="Project Status Overview"
              categories={categories}
              series={series}
              height={400}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

