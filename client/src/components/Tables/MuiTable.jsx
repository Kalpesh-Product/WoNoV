import React from "react";
import useTableControls from "../../hooks/useTableControls";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const MuiTable = ({
  Title,
  columns,
  rows,
  rowKey = "id",
  rowsToDisplay,
  scroll = false,
  scrollHeight = 480,
  showTableControls = true,
  loading = false,
}) => {
  const { filteredRows, toolbar } = useTableControls(rows, columns.map((column) => ({ field: column.id, headerName: column.label })));
  const visibleRows = showTableControls ? filteredRows : rows;
  const displayedRows = rowsToDisplay ? visibleRows.slice(0, rowsToDisplay) : visibleRows;
  const shouldScroll = scroll && (Boolean(rowsToDisplay) || Boolean(scrollHeight));

  return (
    <div className="border-default border-borderGray rounded-md">
      <div className="font-pmedium text-widgetTitle text-primary p-4 border-b uppercase">
        {Title}
      </div>
      <Paper>
        {showTableControls && toolbar}
        <TableContainer
          style={{
            height: shouldScroll ? scrollHeight : "none",
            overflowY: shouldScroll ? "auto" : "hidden",
            overflowX: "auto",
          }}
        >
          <Table stickyHeader={shouldScroll}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    style={{
                      fontWeight: "bold",
                      minWidth: column.minWidth,
                      width: column.width,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
            {loading ? Array.from({ length: rowsToDisplay || 6 }).map((_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || "left"}>
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                ))}
              </TableRow>
            )) : displayedRows.map((row) => (
                <TableRow key={row[rowKey]}>
                  {columns.map((column) => {
                    const value = column.renderCell
                      ? column.renderCell(row)
                      : row[column.id];
                    const displayValue =
                      typeof value === "string" && value.length > 15
                        ? value.slice(0, 15) + "..."
                        : value;

                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        style={{
                          minWidth: column.minWidth,
                          width: column.width,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: column.width || 150, // fallback max width
                          cursor: "default",
                        }}
                        title={
                          typeof value === "string" && value.length > 15
                            ? value
                            : undefined
                        }
                      >
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default MuiTable;
