import PieChart from "../../../components/charts/PieChart"
import BarChart from "../../../components/charts/BarChart"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
import '../../../assets/css/BackOfficeStyles.css'

import { LayoutDashboard } from "lucide-react"
import { 
  fetchGetStatsCategory,
  fetchGetOverview,
  fetchGetStatsDevice,
  fetchCountDashboard
} from '../../../services/Technician/dashboardServices'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useNavigate } from "react-router-dom"
import { userAuth } from '../../../hooks/userAuth'
import { io } from 'socket.io-client'
import { useEffect } from "react"

const Dashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setStatusFilter } = userAuth()
  
  const { data: statsDataCategory = [] } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchGetStatsCategory
  });

  const { data: overviewData = [] } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchGetOverview
  });

  const { data: statsDataDevice = [] } = useQuery({
    queryKey: ["dashboard-stats-device"],
    queryFn: fetchGetStatsDevice
  });

  const { data: countData } = useQuery({
    queryKey: ['count-data'],
    queryFn: fetchCountDashboard
  })

  const statsCategory = statsDataCategory?.data?.ticketCounts || [];
  const overview = overviewData?.data || {};
  const statsDevice = statsDataDevice?.data?.ticketCounts || [];
  const countPendingCompleted = countData?.data || [] 

  // 🔥 Convert API result → PieChart format
  const pieChartData = statsCategory.map((item: any) => ({
    name: item.category_name,
    value: item.ticket_count
  }));

  const pieChartDataDevice = statsDevice.map((item: any) => ({
    name: item.product_name,
    value: item.ticket_count
  }));    

  // fetch real-time updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL_BACKEND as string, {
      transports: ["websocket"], // avoids 400 Bad Request
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '2.5rem' }}>
        {/* Pending Stat Card */}
        <div 
          onClick={() => {
            navigate("/beesee/job-order");
            setStatusFilter("Pending");
          }} 
          className="bo-stat-card"
        >
          <div className="bo-stat-icon" style={{ background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.20), rgba(251, 212, 99, 0.15))' }}>
            <PendingActionsIcon style={{ fontSize: 28, color: '#FDCC00' }} />
          </div>
          <div className="bo-stat-label">Pending</div>
          <div className="bo-stat-value">{countPendingCompleted[0]?.pending || 0}</div>
        </div> 

        {/* Completed Stat Card */}
        <div 
          onClick={() => {
            navigate("/beesee/job-order");
            setStatusFilter("Completed");
          }} 
          className="bo-stat-card"
        >
          <div className="bo-stat-icon" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.20), rgba(34, 197, 94, 0.15))' }}>
            <AssignmentTurnedInIcon style={{ fontSize: 28, color: '#22c55e' }} />
          </div>
          <div className="bo-stat-label">Completed</div>
          <div className="bo-stat-value">{countPendingCompleted[0]?.completed || 0}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bo-glass-card">
          <BarChart
            title="Tickets by Organization"
            categories={overview.categories || []}
            series={overview.series || []}
          />
        </div>
        <div className="bo-glass-card">
          <PieChart 
            title="Ticket issue categories"
            data={pieChartData}
          />
        </div>
        <div className="bo-glass-card">
          <PieChart 
            title="Device issue types"
            data={pieChartDataDevice}
          />
        </div>
      </div>
      
    </div>
  )
}

export default Dashboard