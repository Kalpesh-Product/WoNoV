import React from "react";
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
}) => {
  const displayedRows = rowsToDisplay ? rows.slice(0, rowsToDisplay) : rows; // Default to all rows if not provided

  return (
    <div className="border-default border-borderGray rounded-md">
      <div className="font-pmedium text-title text-primary p-4 border-b">
        {Title}
      </div>
      <Paper>
        <TableContainer
          style={{
            height: scroll && rowsToDisplay ? 385 : "none", // Enable scrolling if scroll is true
            overflowY: scroll && rowsToDisplay ? "auto" : "hidden",
            overflowX: "auto",
          }}
        >
          <Table stickyHeader={scroll && rowsToDisplay}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    style={{ fontWeight: "bold" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(scroll && rowsToDisplay ? rows : displayedRows).map((row) => (
                <TableRow key={row[rowKey]}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"} style={{ minWidth: column.minWidth || 120, }}>
                      {column.renderCell
                        ? column.renderCell(row)
                        : row[column.id]}
                    </TableCell>
                  ))}
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
