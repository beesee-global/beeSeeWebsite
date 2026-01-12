import PieChart from "../../../components/charts/PieChart"
import BarChart from "../../../components/charts/BarChart"
import Breadcrumb from "../../../components/Navigation/Breadcrumbs"
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
    const socket = io(import.meta.env.VITE_API_URL as string);
    socket.on("ticket-updated", () => {
      queryClient.invalidateQueries({queryKey: ['count-data'] });
    });

    return () => {
      socket.off("ticket-updated");
      socket.disconnect();
    }
  }, [])
  
  return (
    <div className="p-6 space-y-10 bg-white">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: 'Dashboard', isActive: true, icon: <LayoutDashboard/>}
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending */}
        <div onClick={() => {
           navigate("/beesee/job-order"),
           setStatusFilter("Pending")
        }} className="flex items-center gap-2 bg-yellow-50 border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-100 transition">
          <PendingActionsIcon className="text-yellow-600" sx={{ fontSize: 30 }} />
          <div className="flex flex-col">
            <span className="text-lg text-yellow-600 font-medium">
              Pending
            </span>
            <span className="text-2xl font-bold text-yellow-700">
              {countPendingCompleted[0]?.pending || 0}
            </span>
          </div>
        </div> 

        {/* Completed */}
        <div 
          onClick={() => {
            navigate("/beesee/job-order")
            setStatusFilter("Completed")
          }} 
          className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 hover:bg-green-100 transition"
        >
          <AssignmentTurnedInIcon className="text-green-600" sx={{ fontSize: 30 }}/>
          <div className="flex flex-col">
            <span className="text-lg text-green-600 font-medium">
              Completed
            </span>
            <span className="text-2xl font-bold text-green-700">
              {countPendingCompleted[0]?.completed || 0}
            </span> 
          </div>
        </div>
        
        {/* <div className="bg-white p-4 rounded-md shadow-md">
          <BarChart
            title="Tickets by Organization"
            categories={overview.categories || []}
            series={overview.series || []}
          />
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <PieChart 
            title= {"Ticket issue categories"}
            data={pieChartData}
          />
        </div>
        <div className="bg-white p-4 rounded-md shadow-md">
          <PieChart 
            title= {"Device issue types"}
            data={pieChartDataDevice}
          />
        </div> */}
      </div>
      
    </div>
  )
}

export default Dashboard
