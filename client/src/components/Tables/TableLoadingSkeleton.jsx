import React from "react";

const getGridColumn = (column) => {
  if (column.width) return `${column.width}px`;
  const flex = Number(column.flex) > 0 ? Number(column.flex) : 1;
  return `minmax(0, ${flex}fr)`;
};

const TableLoadingSkeleton = ({ columns = [], rowCount = 6 }) => {
  const visibleColumns = columns.filter((column) => !column.hide);
  const gridTemplateColumns = visibleColumns.map(getGridColumn).join(" ");

  return (
    <div
      aria-label="Loading table"
      aria-busy="true"
      className="h-full w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden bg-white"
    >
      <div className="box-border w-full min-w-full">
        <div className="grid h-[42px] min-w-0 items-center border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns }}>
          {visibleColumns.map((column, index) => (
            <div key={`${column.field || column.headerName || "column"}-${index}`} className="min-w-0 px-4">
              <div className="h-3 max-w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        {Array.from({ length: rowCount }, (_, rowIndex) => (
          <div key={rowIndex} className="grid h-[50px] min-w-0 items-center border-b border-gray-100" style={{ gridTemplateColumns }}>
            {visibleColumns.map((column, columnIndex) => (
              <div key={`${column.field || column.headerName || "cell"}-${columnIndex}`} className="min-w-0 px-4">
                <div className="h-3 max-w-full animate-pulse rounded bg-gray-100" style={{ width: `${55 + ((rowIndex + columnIndex) % 4) * 10}%` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableLoadingSkeleton;
