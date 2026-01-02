import React, { useState, useEffect } from 'react'; 
import { FaTrashAlt } from 'react-icons/fa';
import { 
  ChevronLeft, 
  Search,
  ChevronRight,  
  Calendar,
  Eye,
} from 'lucide-react'
import CustomSearchField from '../Fields/CustomSearchField';  

interface Column {
  id: string;
  label: string;
  numeric: boolean;
}

interface Row {
  id: number | string;
  pid?: number | string; // optional, since you use row.pid in edit
  [key: string]: any; // allow other dynamic fields
}


interface EnhancedTableProps {
  rows: Row[];
  columns: Column[]; 
  handleRowEdit: (row: Row) => void;
  handleRowDelete: (row: Row) => void;
}

const ConsultationTable: React.FC<EnhancedTableProps> = ({ 
    rows, 
    columns, 
    handleRowEdit, 
    handleRowDelete 
}) => { 
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filteredRows, setFilteredRows] = useState<Row[]>(Array.isArray(rows) ? rows : []);
 
  const handleChangePage = (newPage: number) => {
    if (newPage < 0 || newPage >= Math.ceil(rows.length / rowsPerPage)) return;
    setPage(newPage);
  };

  // --- Filter rows--- 
  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = rows.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredRows(filtered)
    }, 500);

    // clean up timeout when user keeps typing
    return () => clearTimeout(timer);
  }, [rows, searchQuery])

  const visibleRows = Array.isArray(filteredRows)
  ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  : [];

  const generatePageNumbers = () => {
      const totalPages = Math.ceil(rows.length / rowsPerPage);
      const pageNumbers: (number | string)[] = [];

      // If 3 or fewer pages, show all
      if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
      }

      // Current page in 1-indexed format for display
      const currentPage = page + 1;

      // Always include the first page
      pageNumbers.push(1);

      // Handle middle range based on current page
      let middlePages: number[] = [];

      if (currentPage <= 3) {
        // Early pages: show [1, 2, 3]
        middlePages = [2, 3].filter((num) => num <= totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Last pages: show [totalPages-2, totalPages-1]
        middlePages = [totalPages - 2, totalPages - 1].filter((num) => num > 1);
      } else {
        // Middle pages: show [currentPage-1, currentPage, currentPage+1]
        middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
          (num) => num > 1 && num < totalPages
        );
      }

      // Add ellipsis after first page if needed
      if (middlePages[0] > 2) {
        pageNumbers.push('...');
      }

      // Add middle pages, ensuring no duplicates
      middlePages.forEach((num) => {
        if (!pageNumbers.includes(num)) {
          pageNumbers.push(num);
        }
      });

      // Add ellipsis before last page if needed
      if (middlePages[middlePages.length - 1] < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Add last page if not already included and totalPages > 1
      if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }

    return pageNumbers;
  };
  
  useEffect(() => {
    setPage(0); // Reset to first page when rows change
  }, [rows]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* table header with search */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Data Table
            </h3> 
          </div>

          <div>
            <CustomSearchField 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto"> 
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th key={column.id} 
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500
                    dark:text-gray-400 uppercase tracking-wider cursor-pointer 
                    hover: bg-gray-100 dark:hover:bg-gray-600 transition-colors
                    ${
                      column.numeric ? 'text-right' : 'text-left'
                    }`}
                >
                  {column.label}  
                </th>
              ))}
              <th className="bg-gray-100 px-6 py-4 text-right text-xs font-medium text-gray-500 
              dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className='px-6 py-24 text-center text-gray-500 dark:text-gray-400'
                >
                  <div className='flex flex-col items-center'>
                    <Search className='w-12 h-12 text-gray-300 dark:text-gray-600 mb-4'/>
                    <p className='text-lg font-medium'>No data found</p>
                    { searchQuery ? 'Try adjusting your search criteria' : "No items to display"}
                  </div>
                </td>
              </tr>
            ) : ( 
                visibleRows.map((row, index) => (
                  <tr
                    key={row.id}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 
                          dark:text-white`}
                      >
                        <div className='flex items-center'>
                          <span className='truncate max-w-xs'>
                            {column.id === "created_at" && row[column.id]
                                ? new Date(row[column.id]).toLocaleString()
                                : row[column.id]
                            }
                          </span>
                        </div>
                      </td>
                    ))} 

                    {/* button */}
                    <td className='px-6 py-4 whitespace-nowrap text-right
                    text-s font-medium'>
                      <div
                        className='flex items-center justify-end space-x-2'
                      >
                        <button 
                          title='View'
                          onClick={() => handleRowEdit(row)}
                          className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                        transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20'>
                          <Eye className='w-5 h-5'/>
                        </button>
                        <button
                          onClick={() => handleRowDelete(row)}
                          className='p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 
                          transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-red-900/20'
                          title='Set Appointment'
                        > 
                          <Calendar className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        
        {visibleRows.length !== 0 && Math.ceil(rows.length / rowsPerPage) > 1 && (
          <div className="flex justify-end space-x-4 py-4 px-2 flex-wrap gap-2 sm:flex-nowrap border-t border-gray-300">
            <button
              onClick={() => handleChangePage(page - 1)}
              className={`px-4 py-2 text-black flex items-center gap-2 ${
                page === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : ''
              }`}
              disabled={page === 0}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
    
            <div className="flex space-x-2 sm:flex-row flex-wrap gap-1">
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
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ConsultationTable;