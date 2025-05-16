// SimpleTable.tsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Table.css';

export interface ColumnDef {
    headerName: string;
    field: string;
  }
  
  export interface RowData {
    [key: string]: string | number; // To support any row data shape
  }
  

interface TableProps {
  columnDefs: ColumnDef[];
  rowData: RowData[];
}

const SimpleTable = forwardRef<unknown, TableProps>(({ columnDefs, rowData = [] }, ref) => {
  const [sortBy, setSortBy] = useState<string | null>('Year'); // Default to a valid field
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sorting direction if clicking on the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column to sort by and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Sort row data
  const sortedData = React.useMemo(() => {
    if (!Array.isArray(rowData)) return []; // Return empty array if rowData is not an array
    if (!sortBy) return rowData;
  
    const sorted = [...rowData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    console.log("Sorted Data:", sorted); // Log the sorted data to verify it's sorted
    return sorted;
  }, [sortBy, sortDirection, rowData]);
  
  // Example filtered data logic (replace with actual filtering logic)
  const filteredData = sortedData.filter((row: any) => {
    // Apply your filtering logic here
    return true; // Replace with actual condition
  });

  // Expose the filtered data through the ref
  useImperativeHandle(ref, () => ({
    getFilteredData: () => filteredData,
  }));

  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            {columnDefs.map((col, index) => (
              <th
                key={index}
                onClick={() => handleSort(col.field)}
                className={sortBy === col.field ? `sorted-${sortDirection}` : ''}
              >
                {col.headerName}
                {sortBy === col.field ? (sortDirection === 'asc' ? ' 🔼' : ' 🔽') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr><td colSpan={columnDefs.length}>No data available</td></tr>
          ) : (
            filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnDefs.map((col, colIndex) => (
                  <td key={colIndex}>{row[col.field]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default SimpleTable;
