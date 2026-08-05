import PieChart from "../../../components/charts/PieChart"
import BarChart from "../../../components/charts/BarChart"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import '../../../assets/css/BackOfficeStyles.css'

import { LayoutDashboard } from "lucide-react"
import {   
  fetchCountDashboard,
  fetchApplicants,
  fetchCountByMonth,
  fetchCountMostlyIssue
} from '../../../services/Technician/dashboardServices'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {
  User2 
} from 'lucide-react'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useNavigate } from "react-router-dom"
import { userAuth } from '../../../hooks/userAuth'
import { io } from 'socket.io-client'
import { useEffect } from "react"

const Dashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setStatusFilter } = userAuth()
    
  const { data: countData } = useQuery({
    queryKey: ['count-data'],
    queryFn: fetchCountDashboard
  })

  const { data: countByMonth } = useQuery({
    queryKey: ['count-by-month'],
    queryFn: fetchCountByMonth
  })

  const { data: countApplicants } = useQuery({
    queryKey: ['count-applicant'],
    queryFn: fetchApplicants
  })

   const { data: countMostlyIssue } = useQuery({
    queryKey: ['count-mostly-issue'],
    queryFn: fetchCountMostlyIssue
  })
 
  const countPendingCompleted = countData?.data || [] 
  const applicant = countApplicants?.data || [] 
  const mostlyIssue = countMostlyIssue?.data || [] 
  const countByMonths = countByMonth?.data || [] 
  const monthlyCategories = Array.isArray(countByMonths) ? [] : (countByMonths?.categories || [])
  const monthlySeries = Array.isArray(countByMonths) ? [] : (countByMonths?.series || [])
  const top5MostlyIssued = Array.isArray(mostlyIssue) ? [] : (mostlyIssue?.top5MostlyIssued || [])

  // fetch real-time updates
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
      console.log("Connected to socket.io server", socket.id);
    });

    socket.on("ticket-updated", (data) => {
      queryClient.invalidateQueries({ queryKey: ["count-data"] });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.off("ticket-updated");
      socket.disconnect();
    }
  }, [])
  
  return (
    <div className="bo-main-content">
      <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem' }}>
        <Breadcrumb
          items={[
            { label: 'Dashboard', isActive: true, icon: <LayoutDashboard/>}
          ]}
        />
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm"
        style={{ marginBottom: '2.5rem' }}
      >
        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 md:p-6 shadow-md">
          <div className="rounded-lg bg-white p-4 md:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Pending</span>
              <span className="text-2xl font-semibold text-gray-900">
                {countPendingCompleted[0]?.pending || 0}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-base font-semibold text-gray-800">Total</h4>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                className="w-full rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-left transition hover:shadow-sm hover:bg-amber-100/70"
                onClick={() => {
                  navigate("/beesee/job-order");
                  setStatusFilter("Pending");
                }}
              >
                <span className="text-sm text-amber-800">Pending</span>
                <span className="float-right text-sm font-semibold text-amber-900">
                  {countPendingCompleted[0]?.pending || 0}
                </span>
              </button>

              <button
                type="button"
                className="w-full rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-left transition hover:shadow-sm hover:bg-blue-100/70"
                onClick={() => {
                  navigate("/beesee/job-order");
                  setStatusFilter("Ongoing");
                }}
              >
                <span className="text-sm text-blue-800">Ongoing</span>
                <span className="float-right text-sm font-semibold text-blue-900">
                  {countPendingCompleted[0]?.ongoing || 0}
                </span>
              </button>

              <button
                type="button"
                className="w-full rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-left transition hover:shadow-sm hover:bg-emerald-100/70"
                onClick={() => {
                  navigate("/beesee/job-order");
                  setStatusFilter("Completed");
                }}
              >
                <span className="text-sm text-emerald-800">Completed</span>
                <span className="float-right text-sm font-semibold text-emerald-900">
                  {countPendingCompleted[0]?.completed || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-4 md:p-6 shadow-md min-h-[220px] md:min-h-[280px]">
          <BarChart
            title="Ticket Status By Month"
            categories={monthlyCategories}
            series={monthlySeries}
            height={300}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Top 5 Mostly Issued</h3>
          <span className="text-xs md:text-sm text-gray-500">{top5MostlyIssued.length} categories</span>
        </div>

        {top5MostlyIssued.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 text-center">
            No issue data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {top5MostlyIssued.map((category: any) => {
              const issues = category?.issues || []
              const totalReported = issues.reduce((total: number, issue: any) => total + (issue?.total_reported || 0), 0)

              return (
                <div
                  key={category?.categories_id}
                  className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm md:text-base font-semibold text-gray-800">{category?.category_name}</h4>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      Total: {totalReported}
                    </span>
                  </div>

                  {issues.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-500">No issue records.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {issues.map((issue: any) => (
                        <div
                          key={issue?.issues_id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2"
                        >
                          <span className="text-sm text-gray-700">{issue?.issue_name}</span>
                          <span className="text-sm font-semibold text-gray-900">{issue?.total_reported}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
