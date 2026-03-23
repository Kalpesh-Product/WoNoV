import {
  Checkbox,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import PageFrame from "../../components/Pages/PageFrame";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import MuiAside from "../../components/MuiAside";

const ModulePermissions = () => {
  const { state } = useLocation();
  const { user, module, permissions, currentPermissions } = state;

  const axios = useAxiosPrivate();
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    label: "",
    access: "",
    type: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    title: "",
    label: "",
    access: "",
    type: "",
  });

  const { watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      permissions: currentPermissions,
    },
  });

  const formPermissions = new Set(watch("permissions") || []);

  const filterOptions = useMemo(
    () => ({
      access: [...new Set(permissions.map(({ access }) => access || "N/A"))],
      type: [...new Set(permissions.map(({ type }) => type || "N/A"))],
    }),
    [permissions],
  );

  const filteredPermissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return permissions.filter(({ title, label, type, action, access }) => {
      const values = [title, label, type, action, access].filter(Boolean);

      const matchesSearch =
        !query ||
        values.some((value) => value.toString().toLowerCase().includes(query));

      const matchesFilters = Object.entries(appliedFilters).every(
        ([field, value]) => {
          if (!value) return true;

          if (field === "access" || field === "type") {
            const rowValue =
              (field === "access" ? access : type)?.toString() || "N/A";
            return rowValue.toLowerCase() === value.toLowerCase();
          }

          const rowValue = (field === "title" ? title : label)?.toString() || "";
          return rowValue.toLowerCase().includes(value.toLowerCase());
        },
      );

      return matchesSearch && matchesFilters;
    });
  }, [appliedFilters, permissions, searchQuery]);

  const handleToggle = (perm) => {
    const current = new Set(watch("permissions") || []);
    current.has(perm) ? current.delete(perm) : current.add(perm);
    setValue("permissions", Array.from(current));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      title: "",
      label: "",
      access: "",
      type: "",
    };

    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  const mutation = useMutation({
    mutationFn: async (permissions) => {
      const res = await axios.post(
        `/api/access/modify-permissions/${user._id}`,
        { permissions },
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Permissions updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data.permissions);
  };

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex justify-between items-center mb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            {module.charAt(0).toUpperCase() + module.slice(1)} Permissions
          </span>
          <PrimaryButton
            title={isEditing ? "Cancel" : "Edit"}
            handleSubmit={() => setIsEditing((prev) => !prev)}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <hr className="my-2" />

          <div className="flex justify-between items-center gap-4 mb-4 pt-2">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search permissions"
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <IoIosSearch size={20} style={{ marginRight: 8 }} />
                ),
              }}
            />
            <div
              className="p-2 hover:bg-gray-200 cursor-pointer rounded-full border-[1px] border-borderGray"
              onClick={() => setFilterDrawerOpen(true)}
            >
              <IoFilter />
            </div>
          </div>

          <TableContainer
            component={Paper}
            className="my-4"
            sx={{ maxHeight: 400, overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    Sr. No.
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    Permission
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Access
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Allow
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPermissions.map(
                  ({ title, key, label, type, action, access }, index) => (
                    <TableRow key={key}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{title}</TableCell>
                      <TableCell>{label}</TableCell>
                      <TableCell align="center">{access || "N/A"}</TableCell>
                      <TableCell align="center">{type || "N/A"}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={formPermissions.has(action)}
                          disabled={!isEditing}
                          onChange={() => isEditing && handleToggle(action)}
                        />
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="flex w-full justify-center items-center">
            {isEditing && (
              <PrimaryButton
                title="Update Permissions"
                type="submit"
                isLoading={mutation.isPending}
                disabled={mutation.isPending}
              />
            )}
          </div>
        </form>

        <MuiAside
          open={isFilterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Advanced Filter"
        >
          <TextField
            label="Title"
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            value={filters.title}
            onChange={(event) => handleFilterChange("title", event.target.value)}
          />
          <TextField
            label="Permission"
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            value={filters.label}
            onChange={(event) => handleFilterChange("label", event.target.value)}
          />
          <TextField
            select
            label="Access"
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            value={filters.access}
            onChange={(event) => handleFilterChange("access", event.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.access.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Type"
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            value={filters.type}
            onChange={(event) => handleFilterChange("type", event.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.type.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <div className="flex items-center gap-4 justify-center py-4">
            <PrimaryButton title="Apply Filters" handleSubmit={applyFilters} />
            <SecondaryButton title="Clear Filters" handleSubmit={clearFilters} />
          </div>
        </MuiAside>
      </PageFrame>
    </div>
  );
};

export default ModulePermissions;
// import {
//   Checkbox,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { useLocation } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import PrimaryButton from "../../components/PrimaryButton";
// import { toast } from "sonner";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import { useMutation } from "@tanstack/react-query";
// import { useState } from "react";
// import PageFrame from "../../components/Pages/PageFrame";

// const ModulePermissions = () => {
//   const { state } = useLocation();
//   const { user, module, permissions, currentPermissions } = state;

//   const axios = useAxiosPrivate();
//   const [isEditing, setIsEditing] = useState(false);

//   const { register, watch, setValue, handleSubmit } = useForm({
//     defaultValues: {
//       permissions: currentPermissions,
//     },
//   });

//   const formPermissions = new Set(watch("permissions") || []);

//   const handleToggle = (perm) => {
//     const current = new Set(watch("permissions") || []);
//     current.has(perm) ? current.delete(perm) : current.add(perm);
//     setValue("permissions", Array.from(current));
//   };

//   const mutation = useMutation({
//     mutationFn: async (permissions) => {
//       const res = await axios.post(
//         `/api/access/modify-permissions/${user._id}`,
//         { permissions },
//       );
//       return res.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Permissions updated successfully");
//       setIsEditing(false); // disable editing after success
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Update failed");
//     },
//   });

//   const onSubmit = (data) => {
//     mutation.mutate(data.permissions);
//   };

//   return (
//     <div className="p-4">
//       <PageFrame>
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-title font-pmedium text-primary uppercase">
//             {module.charAt(0).toUpperCase() + module.slice(1)} Permissions
//           </span>
//           <PrimaryButton
//             title={isEditing ? "Cancel" : "Edit"}
//             handleSubmit={() => setIsEditing((prev) => !prev)}
//           />
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <TableContainer
//             component={Paper}
//             className="my-4"
//             sx={{ maxHeight: 400, overflowY: "auto" }}
//           >
//             <Table stickyHeader>
//               <TableHead>
//                 <TableRow>
//                   <TableCell
//                     sx={{ fontWeight: "bold", textTransform: "uppercase" }}
//                   >
//                     Title
//                   </TableCell>{" "}
//                   <TableCell
//                     sx={{ fontWeight: "bold", textTransform: "uppercase" }}
//                   >
//                     Permission
//                   </TableCell>
//                   <TableCell
//                     align="center"
//                     sx={{ fontWeight: "bold", textTransform: "uppercase" }}
//                   >
//                     Access
//                   </TableCell>
//                   <TableCell
//                     align="center"
//                     sx={{ fontWeight: "bold", textTransform: "uppercase" }}
//                   >
//                     Type
//                   </TableCell>
//                   <TableCell
//                     align="center"
//                     sx={{ fontWeight: "bold", textTransform: "uppercase" }}
//                   >
//                     Allow
//                   </TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {permissions.map(
//                   ({ title, key, label, type, action, access }) => (
//                     <TableRow key={key}>
//                       <TableCell>{title}</TableCell>
//                       <TableCell>{label}</TableCell>
//                       <TableCell align="center">{access || "N/A"}</TableCell>
//                       <TableCell align="center">{type}</TableCell>
//                       <TableCell align="center">
//                         <Checkbox
//                           checked={formPermissions.has(action)}
//                           disabled={!isEditing}
//                           onChange={() => isEditing && handleToggle(action)}
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ),
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <div className="flex w-full justify-center items-center">
//             {isEditing && (
//               <PrimaryButton
//                 title="Update Permissions"
//                 type="submit"
//                 isLoading={mutation.isPending}
//                 disabled={mutation.isPending}
//               />
//             )}
//           </div>
//         </form>
//       </PageFrame>
//     </div>
//   );
// };

// export default ModulePermissions;
