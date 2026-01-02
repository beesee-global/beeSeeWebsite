import React from "react";
import { Laptop, Monitor, Watch, Tablet, Smartphone, Server } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  count: number;
}

interface Props {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryFilter: React.FC<Props> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, React.ReactNode> = {
      all: <Server className="w-4 h-4" />,
      laptops: <Laptop className="w-4 h-4" />,
      displays: <Monitor className="w-4 h-4" />,
      wearables: <Watch className="w-4 h-4" />,
      tablets: <Tablet className="w-4 h-4" />,
      smartphones: <Smartphone className="w-4 h-4" />,
      accessories: <Server className="w-4 h-4" />,
    };
    return icons[categoryId] || <Server className="w-4 h-4" />;
  };

  return (
    <div className="w-full">

      {/* DESKTOP */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-pill-advanced ${isActive ? "active" : ""}`}
            >
              <div className="category-pill-icon-advanced">
                {getCategoryIcon(category.id)}
              </div>

              <span className="category-pill-name-advanced">
                {category.name}
              </span>

              <span className="category-pill-count-advanced">
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE */}
      <div className="grid grid-cols-2 gap-3 md:hidden mt-4">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-pill-advanced ${isActive ? "active" : ""}`}
            >
              <div className="category-pill-icon-advanced">
                {getCategoryIcon(category.id)}
              </div>

              <span className="category-pill-name-advanced">
                {category.name}
              </span>

              <span className="category-pill-count-advanced">
                {category.count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default CategoryFilter;
