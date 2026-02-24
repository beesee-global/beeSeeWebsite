import React from "react";
import ProductCard, { Product } from "./ProductCard";
export type { Product } from "./ProductCard";
import { useNavigate, useNavigation } from "react-router-dom";

// Mobile detection hook for ProductGrid
const useIsMobile = () => {
  const navigate = useNavigate ();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
}) => {
  const isMobile = useIsMobile();

  // Different grid layout for mobile vs desktop
  const gridClasses = isMobile 
    ? "grid grid-cols-1 gap-6 mb-12"  // Single column on mobile
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"; // Multi-column on desktop

  return (
    <div className={gridClasses}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
         /*  onClick={() => onProductClick?.(product)} */
        />
      ))}
    </div>
  );
};

export default ProductGrid;