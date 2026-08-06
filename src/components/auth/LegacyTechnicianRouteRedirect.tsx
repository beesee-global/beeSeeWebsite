import { Navigate, useLocation } from "react-router-dom";

const LegacyTechnicianRouteRedirect = () => {
  const location = useLocation();
  const legacyPath = location.pathname.replace(/^\/beesee\/technician\/?/, "");
  const destination = legacyPath
    ? `/beesee/${legacyPath}`
    : "/beesee/dashboard";

  return <Navigate to={`${destination}${location.search}${location.hash}`} replace />;
};

export default LegacyTechnicianRouteRedirect;
