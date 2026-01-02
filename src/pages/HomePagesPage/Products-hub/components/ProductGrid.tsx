import React from "react";
import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
