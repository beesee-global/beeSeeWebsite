import React from "react";
import {
  Watch,
  Laptop,
  Tablet,
  Tv,
  Server,
  HelpCircle,
} from "lucide-react";

export interface FAQCategory {
  id: string;
  name: string;
  count: number;
}

interface Props {
  categories: FAQCategory[];
  selected: string;
  onChange: (id: string) => void;
}

const FAQCategoryFilter: React.FC<Props> = ({
  categories,
  selected,
  onChange,
}) => {
  const getIcon = (id: string) => {
    const icons: Record<string, React.ReactNode> = {
      all: <Server className="w-4 h-4" />,
      "Smart Watch": <Watch className="w-4 h-4" />,
      Laptop: <Laptop className="w-4 h-4" />,
      Tablet: <Tablet className="w-4 h-4" />,
      "Interactive Smart TV": <Tv className="w-4 h-4" />,
      default: <HelpCircle className="w-4 h-4" />,
    };
    return icons[id] || icons.default;
  };

  return (
    <div className="w-full mt-8">
      {/* DESKTOP */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {categories.map((c) => {
          const isActive = selected === c.id;

          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`category-pill-advanced ${
                isActive ? "active" : ""
              }`}
            >
              <div className="category-pill-icon-advanced">
                {getIcon(c.id)}
              </div>

              <span className="category-pill-name-advanced">
                {c.name}
              </span>

              <span className="category-pill-count-advanced">
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE */}
      <div className="grid grid-cols-2 gap-3 md:hidden mt-4">
        {categories.map((c) => {
          const isActive = selected === c.id;

          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`category-pill-advanced ${
                isActive ? "active" : ""
              }`}
            >
              <div className="category-pill-icon-advanced">
                {getIcon(c.id)}
              </div>

              <span className="category-pill-name-advanced">
                {c.name}
              </span>

              <span className="category-pill-count-advanced">
                {c.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FAQCategoryFilter;
