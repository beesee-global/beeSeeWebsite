import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to homepage after 2 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#FDCC00' }}>404</h1>
        <p className="text-xl mb-4">Page not found</p>
        <p className="text-gray-400">Redirecting to homepage...</p>
      </div>
    </div>
  );
};

export default NotFound;