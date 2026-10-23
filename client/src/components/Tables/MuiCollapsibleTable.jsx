import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box,
  Paper,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useState } from "react";
import React from "react";
import useTableControls from "../../hooks/useTableControls";

const CollapsibleTable = ({ columns, data, renderExpandedRow }) => {
  const { filteredRows, toolbar } = useTableControls(data, columns);
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (rowId) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  // Add SR NO column dynamically
  const enhancedColumns = [{ field: "_srNo", headerName: "Sr No" }, ...columns];

  return (
    <TableContainer component={Paper}>
      {toolbar}
      <Table stickyHeader>
        <TableHead>
          <TableRow className="font-pmedium">
            {enhancedColumns.map((col) => (
              <TableCell
                align="center"
                key={col.field}
                sx={{ fontWeight: "bold" }}
              >
                {col.headerName}
              </TableCell>
            ))}
            <TableCell
              align="center"
              colSpan={1}
              sx={{ fontWeight: "bold", padding: "8px" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
            <TableCell
              align="center"
              colSpan={enhancedColumns.length + 1}
              sx={{ height: "72px" }}
            >
              No rows to show
            </TableCell>
          </TableRow>
          
          ) : (
            filteredRows.map((row, index) => {
              const rowId = row.id ?? data.indexOf(row);
              return (
                <React.Fragment key={rowId}>
                  <TableRow>
                    {enhancedColumns.map((col) => (
                      <TableCell
                        align="center"
                        key={col.field}
                        sx={{ padding: "8px" }}
                      >
                        {col.field === "_srNo" ? index + 1 : row[col.field]}
                      </TableCell>
                    ))}
                    <TableCell colSpan={1} align="center">
                      <IconButton size="small" onClick={() => toggleRow(rowId)}>
                        {openRows[rowId] ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={enhancedColumns.length + 2}
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                    >
                      <Collapse
                        in={openRows[rowId]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>{renderExpandedRow(row)}</Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CollapsibleTable;
