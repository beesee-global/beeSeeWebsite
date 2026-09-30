import React from "react";
import ProductCard, { Product } from "./ProductCard";
export type { Product } from "./ProductCard";

// Mobile detection hook for ProductGrid
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  React.useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const checkMobile = (event: MediaQueryListEvent | MediaQueryList) => setIsMobile(event.matches);

    checkMobile(mobileViewport);
    mobileViewport.addEventListener("change", checkMobile);
    return () => mobileViewport.removeEventListener("change", checkMobile);
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
          key={product.pid}
          product={product}
          index={index}
          isMobile={isMobile}
         /*  onClick={() => onProductClick?.(product)} */
        />
      ))}
    </div>
  );
};

export default ProductGrid;
