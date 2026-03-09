import { Outlet } from "react-router-dom"
import NavigationTechnician from "../components/ui/NavigationTechnician"
import SidebarTechnician from "../components/ui/SidebarTechnician"
import { userAuth } from '../hooks/userAuth'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SnackbarTechnician from "../components/feedback/SnackbarTechnician" 
const TechnicianLayout = () => {
  const { 
    token, 
    userInfo, 
    userNav, 
    setUserNav,  
    snackBarMessage,
    snackBarOpen,
    snackBarType,
    setSnackBarOpen
  } = userAuth() 
  const navigate = useNavigate(); 
  const [isChecking, setIsChecking] = useState(true); 
  
  useEffect(() => {
    // if we don't have a token, go back to home
    if (!token) {
      navigate("/", { replace: true });
      localStorage.clear();
      return;
    }

    // if user is admin, redirect to admin dashboard
    if (userInfo?.url_permission !== "technician_url") {
      setIsChecking(false)
      navigate("/tech/sign-in", { replace: true });
      localStorage.clear();
      return;
    } 
    // Done checking
    setIsChecking(false);
  }, [token, userInfo]);

  /* automatic close on wider screens */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setUserNav(false)
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, [setUserNav])

  /* prevent body scroll when mobile sidebar is open */
  useEffect(() => {
    if (userNav) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [userNav])

  /* handle escape key to close mobile sidebar */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && userNav) {
        setUserNav(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [userNav, setUserNav])
 
  // 👇 Prevent rendering layout until checks are done
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Snackbar */}
      <SnackbarTechnician 
        open={snackBarOpen} 
        type={snackBarType} 
        message={snackBarMessage} 
        onClose={() => setSnackBarOpen(false)} 
      />

      {/* Mobile view sidebar overlay and drawer */}
      {userNav && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Dark overlay with fade animation */}
          <div 
            onClick={() => setUserNav(false)}
            className="absolute inset-0 bg-black/50 animate-fadeIn backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sidebar drawer with slide animation */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] animate-slideIn overflow-y-auto touch-pan-y shadow-2xl"
            style={{ 
              backgroundColor: '#000000',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)'
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <SidebarTechnician setShowSidebar={setUserNav} />
          </div>
        </div>
      )}

      {/* Desktop view */}
      {/* Sidebar */}
      <aside 
        className="hidden md:block border-r border-gray-800 overflow-y-auto overflow-x-hidden" 
        style={{ backgroundColor: '#000000' }}
      >
        <SidebarTechnician />
      </aside>

      {/* Body Section */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        {/* Navigation */}
        <div className="relative">
          <NavigationTechnician />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TechnicianLayout