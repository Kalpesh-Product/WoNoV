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
  const displayedRows = rowsToDisplay ? rows.slice(0, rowsToDisplay) : rows;

  return (
    <div className="border-default border-borderGray rounded-md">
      <div className="font-pmedium text-title text-primary p-4 border-b">
        {Title}
      </div>
      <Paper>
        <TableContainer
          style={{
            // height: scroll && rowsToDisplay ? 385 : "none",
            height: scroll && rowsToDisplay ? 480 : "none",
            overflowY: scroll && rowsToDisplay ? "auto" : "hidden",
            overflowX: "auto",
          }}>
          <Table stickyHeader={scroll && rowsToDisplay}>
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
                    }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(scroll && rowsToDisplay ? rows : displayedRows).map((row) => (
                <TableRow key={row[rowKey]}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      style={{
                        minWidth: column.minWidth,
                        width: column.width,
                      }}>
                      {column.renderCell
                        ? column.renderCell(row) // Now row is properly passed
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
