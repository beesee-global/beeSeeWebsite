import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "./CustomDropdown";

interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;

  sortBy: string;
  onSortChange: (v: string) => void;

  showFilters: boolean;
  onToggleFilters: () => void;

  onClearFilters: () => void;

  priceRange: string;
  onPriceRangeChange: (v: string) => void;
}

const SearchAndFilters: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  priceRange,
  onPriceRangeChange,
}) => {
  return (
    <div className="mb-8 space-y-4">

      {/* SEARCH + FILTERS GROUP */}
      <div className="flex flex-col md:flex-row gap-4 w-full">

        {/* SEARCH BAR */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C7B897] w-5 h-5" />

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full pl-12 pr-12 py-3
              bg-[#1a1a1a]
              border border-[#FDCC00]/30
              rounded-lg
              text-white
              placeholder-[#C7B897]/50
              focus:border-[#FDCC00]
            "
          />

          {searchQuery && (
            <X
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7B897] w-5 h-5 cursor-pointer hover:text-[#FDCC00]"
              onClick={() => onSearchChange("")}
            />
          )}
        </div>

        {/* FILTER BUTTON */}
        <button
          onClick={onToggleFilters}
          className="
            flex items-center justify-center gap-2
            px-6 py-3
            bg-[#1a1a1a]
            border border-[#FDCC00]/30
            rounded-lg
            text-[#FDCC00]
            hover:bg-[#FDCC00]/10
            transition-colors
            w-full md:w-auto
          "
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>

      </div>

      {/* FILTER PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-6 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg space-y-8">

              {/* PRICE RANGE */}
              <div className="space-y-2 w-full">
                <h3 className="text-[#FDCC00] font-semibold">Price Range</h3>

                <CustomDropdown
                  value={priceRange}
                  onChange={onPriceRangeChange}
                  options={[
                    { label: "All Prices", value: "" },
                    { label: "₱0 – ₱5,000", value: "0-5000" },
                    { label: "₱5,000 – ₱20,000", value: "5000-20000" },
                    { label: "₱20,000 – ₱50,000", value: "20000-50000" },
                    { label: "₱50,000 – ₱100,000", value: "50000-100000" },
                    { label: "₱100,000+", value: "100000+" },
                  ]}
                />
              </div>

              {/* SORT BY */}
              <div className="space-y-2 w-full">
                <h3 className="text-[#FDCC00] font-semibold">Sort By</h3>

                <CustomDropdown
                  value={sortBy}
                  onChange={onSortChange}
                  options={[
                    { label: "Name (A–Z)", value: "name-asc" },
                    { label: "Name (Z–A)", value: "name-desc" },
                    { label: "Price (Low → High)", value: "price-asc" },
                    { label: "Price (High → Low)", value: "price-desc" },
                  ]}
                />
              </div>

              {/* CLEAR FILTERS */}
              <button
                onClick={onClearFilters}
                className="
                  px-4 py-2
                  bg-[#2a2a2a]
                  text-[#C7B897]
                  rounded-lg
                  hover:bg-[#FDCC00]/20
                  transition-all
                "
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SearchAndFilters;
