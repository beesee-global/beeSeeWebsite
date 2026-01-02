import React from "react";
import { PropagateLoader } from "react-spinners";

interface BackDropLoaderProps {
  loading?: boolean;
}

const BackDropLoader: React.FC<BackDropLoaderProps> = ({ loading = true }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <PropagateLoader color="#FCD000" size={15} aria-label="Loading Spinner" />
    </div>
  );
};

export default BackDropLoader;
