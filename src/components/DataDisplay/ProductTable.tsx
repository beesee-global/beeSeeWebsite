import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Search,
  ChevronRight,
  Edit3,
  Trash2,
  BadgeCheck
} from 'lucide-react';
import CustomSearchField from '../Fields/CustomSearchField'; 

interface Column {
  id: string;
  label: string;
  numeric: boolean;
}

interface Row {
  id: number | string;
  pid?: number | string;
  images?: string; // optional image field
  [key: string]: any;
}

interface EnhancedTableProps {
  rows: Row[];
  columns: Column[];
  handleRowEdit: (id: number | string) => void;
  handleRowDelete: (id: number | string, status: string) => void; 
}

const EnhancedTable: React.FC<EnhancedTableProps> = ({
  rows,
  columns,
  handleRowEdit,
  handleRowDelete,
}) => {
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredRows, setFilteredRows] = useState<Row[]>(Array.isArray(rows) ? rows : []);

  const handleChangePage = (newPage: number) => {
    if (newPage < 0 || newPage >= Math.ceil(rows.length / rowsPerPage)) return;
    setPage(newPage);
  };

  // ✅ Check if any row has an image
  const hasImageColumn = rows.some((row) => row.images);

  // --- Filter and sort rows (images first) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = rows.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      // 🔥 Sort rows — those with images come first
      filtered.sort((a, b) => {
        const hasImageA = a.images ? 1 : 0;
        const hasImageB = b.images ? 1 : 0;
        return hasImageB - hasImageA; // descending
      });

      setFilteredRows(filtered);
    }, 400);

    return () => clearTimeout(timer);
  }, [rows, searchQuery]);

  const visibleRows = Array.isArray(filteredRows)
    ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  const generatePageNumbers = () => {
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const currentPage = page + 1;
    pageNumbers.push(1);

    let middlePages: number[] = [];
    if (currentPage <= 3) {
      middlePages = [2, 3].filter((num) => num <= totalPages);
    } else if (currentPage >= totalPages - 2) {
      middlePages = [totalPages - 2, totalPages - 1].filter((num) => num > 1);
    } else {
      middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
        (num) => num > 1 && num < totalPages
      );
    }

    if (middlePages[0] > 2) {
      pageNumbers.push('...');
    }

    middlePages.forEach((num) => {
      if (!pageNumbers.includes(num)) {
        pageNumbers.push(num);
      }
    });

    if (middlePages[middlePages.length - 1] < totalPages - 1) {
      pageNumbers.push('...');
    }

    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  useEffect(() => {
    setPage(0);
  }, [rows]);

  console.log("data", visibleRows)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data
          </h3>
          <CustomSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {/* ✅ Conditionally render Profile header */}
              {hasImageColumn && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Image
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500
                    dark:text-gray-400 uppercase tracking-wider ${
                      column.numeric ? 'text-right' : 'text-left'
                    }`}
                >
                  {column.label}
                </th>
              ))}

              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasImageColumn ? 2 : 1)}
                  className="px-6 py-24 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-lg font-medium">No data found</p>
                    {searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'No items to display'}
                  </div>
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id}>
                  {/* ✅ Conditionally render Profile image cell */}
                  {hasImageColumn && (
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <div>
                        {row.images && (
                        <img
                          src={row.images[0].image_url}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        />
                      )}
                      </div> 
                    </td>
                  )}

                  {/* Other columns */}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                    >
                      {row[column.id]}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {row.status !== 'Inactive' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          title="Edit"
                          onClick={() => handleRowEdit(row.pid ?? row.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRowDelete(row.id, row.status)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className='flex items-center justify-center space-x-2'>
                        <button
                          title="Enabled"
                          onClick={() => handleRowDelete(row.id, row.status)}
                          className='p-2 text-gray hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50'
                        >
                          <BadgeCheck className='w-5 h-5x'/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {visibleRows.length !== 0 && Math.ceil(rows.length / rowsPerPage) > 1 && (
          <div className="flex justify-end space-x-4 py-4 px-2 border-t border-gray-300">
            <button
              onClick={() => handleChangePage(page - 1)}
              className={`px-4 py-2 text-black flex items-center gap-2 ${
                page === 0 ? 'text-gray-300 cursor-not-allowed' : ''
              }`}
              disabled={page === 0}
            >
              <ChevronLeft size={20} /> Previous
            </button>

            <div className="flex space-x-2">
              {generatePageNumbers().map((number, index) => (
                <button
                  key={`${number}-${index}`}
                  onClick={() =>
                    typeof number === 'number' && handleChangePage(number - 1)
                  }
                  className={`px-4 py-2 rounded-md ${
                    typeof number === 'number' && page + 1 === number
                      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
                      : 'bg-white text-gray-400'
                  } ${typeof number === 'string' ? 'cursor-default' : ''}`}
                  disabled={typeof number === 'string'}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= Math.ceil(rows.length / rowsPerPage) - 1}
              className={`px-4 py-2 text-black flex items-center gap-2 ${
                page >= Math.ceil(rows.length / rowsPerPage) - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : ''
              }`}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTable;
