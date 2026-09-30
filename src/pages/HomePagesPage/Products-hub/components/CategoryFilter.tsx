import React from "react"; 
import { motion, useReducedMotion } from "framer-motion";
import { LucideIcon } from '../../../../utils/lucideIconLoader'
export interface Category {
  id: string | number;
  name: string;
  icon?: string;
  hoverSpecs?: string[];
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
  const prefersReducedMotion = useReducedMotion();

  const renderIcon = (icon?: string) => {
    if (!icon) return null;

    // If icon contains non-alphanumeric characters (emoji or custom text), render as text
    // e.g. "💻", "📺", or plain textual emoji labels
    if (/[^A-Za-z0-9_-]/.test(icon)) {
      return <span className="text-lg leading-none -mt-0.5">{icon}</span>;
    }

    // Otherwise treat it as a lucide icon name
    return <LucideIcon name={icon} size={18} />;
  };

  return (
    <div className="w-full">
      {/* DESKTOP */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {categories.map((category) => {
          const isActive = selectedCategory === String(category.id);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(String(category.id))}
              className={`category-pill-advanced ${isActive ? "active" : ""}`}
            >
              <div className="category-pill-icon-advanced">
                {renderIcon(category.icon)}
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
        {categories.map((category, index) => {
          const isActive = selectedCategory === String(category.id);

          return (
            <motion.div
              key={category.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -32 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.42,
                delay: prefersReducedMotion ? 0 : index * 0.09,
                ease: "easeOut",
              }}
            >
              <button
                type="button"
                onClick={() => onCategoryChange(String(category.id))}
                className={`category-pill-advanced w-full ${isActive ? "active" : ""}`}
              >
                <div className="category-pill-icon-advanced">
                  {renderIcon(category.icon)}
                </div>

                <span className="category-pill-name-advanced">
                  {category.name}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
