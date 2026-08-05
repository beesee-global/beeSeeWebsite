import React from "react"; 
import { LucideIcon } from '../../../../utils/lucideIconLoader'
export interface Category {
  id: string;
  name: string;
  icon: string
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
                <LucideIcon name={category.icon} size={18} />
              </div>

              <span className="category-pill-name-advanced">
                {category.name}
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
                 <LucideIcon name={category.icon} size={18} />
              </div>

              <span className="category-pill-name-advanced">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
