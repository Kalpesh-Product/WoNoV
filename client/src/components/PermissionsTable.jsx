import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from "@mui/material";

const PermissionsTable = ({ modules, onPermissionChange }) => {
  const [permissions, setPermissions] = useState(modules);

  // Handle checkbox change
  const handleCheckboxChange = (moduleIndex, submoduleIndex, action) => {
    const updatedPermissions = [...permissions];

    const submodule =
      updatedPermissions[moduleIndex].submodules[submoduleIndex];

    if (submodule.grantedActions.includes(action)) {
      // Remove action if already granted
      submodule.grantedActions = submodule.grantedActions.filter(
        (act) => act !== action
      );
    } else {
      // Add action if not granted
      submodule.grantedActions.push(action);
    }

    setPermissions(updatedPermissions);
    onPermissionChange(updatedPermissions); // Send updated permissions to parent
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {permissions.map((module, moduleIndex) => (
          <div key={module.name}>
            {/* Module Name */}
            <span className="text-subtitle font-pregular mb-2">
              {module.name}
            </span>

            {/* Table for Submodules */}
            <TableContainer
              style={{ height: 400, overflowY: "scroll" }}
              component={Paper}
              className="mb-4 "
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Submodule</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Read</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Write</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {module.submodules.map((submodule, submoduleIndex) => (
                    <TableRow key={submodule.submoduleName}>
                      <TableCell>{submodule.submoduleName}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={submodule.grantedActions.includes("View")}
                          onChange={() =>
                            handleCheckboxChange(
                              moduleIndex,
                              submoduleIndex,
                              "View"
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={submodule.grantedActions.includes("Edit")}
                          onChange={() =>
                            handleCheckboxChange(
                              moduleIndex,
                              submoduleIndex,
                              "Edit"
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsTable;
