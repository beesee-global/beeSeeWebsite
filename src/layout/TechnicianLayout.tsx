import { Outlet } from "react-router-dom"
import NavigationTechnician from "../components/ui/NavigationTechnician"
import SidebarTechnician from "../components/ui/SidebarTechnician"
import { userAuth } from '../hooks/userAuth'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const TechnicianLayout = () => {
  const { 
    token, 
    userInfo, 
    userNav, 
    setUserNav,  
  } = userAuth() 
  const navigate = useNavigate(); 
  const [isChecking, setIsChecking] = useState(true); 
  
  useEffect(() => {
    // if we don't have a token, go back to home
/*     if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // if user is admin, redirect to admin dashboard
    if (userInfo?.role) {
      setIsChecking(false)
      navigate("/beesee/dashboard", { replace: true });
      return;
    } */
    // Done checking
    setIsChecking(false);
  }, [token, userInfo, navigate]);

  /* automatic close on wider screens */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setUserNav(false)
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, [])
 
  // 👇 Prevent rendering layout until checks are done
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile view sidebar */}
      {userNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark Theme */}
          <div 
            onClick={() => setUserNav(false)}
            className="absolute inset-0 bg-black bg-opacity-40"
          />

          <div className="absolute left-0 top-0 h-screen w-80 animate-slideIn overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-700'">
            <SidebarTechnician />
          </div>
        </div>
      )}

      {/* Desktop view */}
      {/* Sidebar (optional) */}
      <aside className={`hidden md:block bg-white border-r border-gray-200  overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-700 overflow-hidden`}>
        <SidebarTechnician />
      </aside>

      {/* Body Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navigation */}
        <div>
          <NavigationTechnician />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TechnicianLayout
