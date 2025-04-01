import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Paper,
} from "@mui/material";

const AccessGrantTable = ({
  title,
  permissions,
  selectAll,
  handleSelectAll,
  handlePermissionChange,
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        border: "2px solid #e2dddd",
        borderRadius: "10px",
        paddingX: 2,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="left" colSpan={2}>
              <Typography variant="h6" sx={{ padding: 1, textAlign: "start" }}>
                {title}
              </Typography>
            </TableCell>
            <TableCell colSpan={3}>
              <Checkbox
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Module</TableCell>
            <TableCell align="center">Read</TableCell>
            <TableCell align="center">Write</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {permissions.map((perm, index) => (
            <TableRow key={perm.name}>
              <TableCell>{perm.name}</TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={perm.read}
                  onChange={(e) =>
                    handlePermissionChange(index, "read", e.target.checked)
                  }
                />
              </TableCell>
              <TableCell align="center">
                <Checkbox
                  checked={perm.write}
                  onChange={(e) =>
                    handlePermissionChange(index, "write", e.target.checked)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccessGrantTable;
