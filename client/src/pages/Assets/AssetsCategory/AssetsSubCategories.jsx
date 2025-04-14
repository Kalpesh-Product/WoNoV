// import { useState } from "react";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   CircularProgress,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import PrimaryButton from "../../../components/PrimaryButton";
// import MuiModal from "../../../components/MuiModal";
// import { useForm, Controller } from "react-hook-form";
// import {
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   FormHelperText,
// } from "@mui/material";
// import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
// import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
// import { toast } from "sonner";

// const AssetsSubCategories = () => {
//   const axios = useAxiosPrivate();
//   const queryClient = new QueryClient();
//   const [isModalOpen, setModalOpen] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm();

//   const {
//     data: assetsSubCategories = [],
//     isPending: isPendingAssetsSubCategories,
//   } = useQuery({
//     queryKey: ["assetsSubCategories"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get("/api/assets/get-subcategory");
//         return response.data;
//       } catch (error) {
//         throw new Error(error.response.data.message);
//       }
//     },
//   });

//   const { data: assetsCategories = [], isPending: isCategoryPending } =
//     useQuery({
//       queryKey: ["assetsCategories"],
//       queryFn: async () => {
//         try {
//           const response = await axios.get("/api/assets/get-category");
//           return response.data;
//         } catch (error) {
//           throw new Error(error.response.data.message);
//         }
//       },
//     });

//   const { mutate: createSubCategory, isPending: isCreateSubCategory } =
//     useMutation({
//       mutationFn: async (data) => {
//         const response = await axios.post(
//           "/api/assets/create-asset-subcategory",
//           {
//             assetCategoryId: data.assetCategoryId,
//             assetSubCategoryName: data.assetSubCategoryName,
//           }
//         );
//         return response.data;
//       },
//       onSuccess: function (data) {
//         toast.success(data.message);
//         queryClient.invalidateQueries({ queryKey: ["assetsSubCategories"] });
//         setModalOpen(false);
//         reset();
//       },
//       onError: function (data) {
//         toast.error(data.response.data.message || "Failed to add category");
//       },
//     });

//   const { mutate: disableSubCategory, isPending: isRevoking } = useMutation({
//     mutationFn: async (assetSubCategoryId) => {
//       const response = await axios.patch(
//         `/api/assets/disable-asset-subcategory/${assetSubCategoryId}`
//       );

//       return response.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data.message);
//       queryClient.invalidateQueries({ queryKey: ["assetsSubCategories"] });
//     },
//     onError: (error) => {
//       toast.error(error.response.data.message || "Failed to disable category");
//     },
//   });
//   const handleAddSubCategory = (data) => {
//     createSubCategory(data);
//   };

//   return (
//     <Box>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//       >
//         <span className="text-title text-primary font-pmedium">
//           Assets Sub Categories
//         </span>
//         {assetsCategories.length > 0 && (
//           <PrimaryButton
//             title="Add Sub Category"
//             handleSubmit={() => setModalOpen(true)}
//           />
//         )}
//       </Box>

//       {isRevoking || isPendingAssetsSubCategories ||  isCategoryPending ? (
//         <CircularProgress color="#1E3D73"/>
//       ) : assetsSubCategories.length > 0 ? (
//         assetsSubCategories.map((category) => (
//           <Accordion key={category._id}>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Box
//                 display="flex"
//                 justifyContent="space-between"
//                 width="100%"
//                 alignItems={"center"}
//               >
//                 <span className="text-subtitle">{category.categoryName}</span>
//                 <span className="text-content">
//                   {category.subCategories.length}{" "}
//                   {category.subCategories.length === 1
//                     ? "Subcategory"
//                     : "Subcategories"}
//                 </span>
//               </Box>
//             </AccordionSummary>
//             <AccordionDetails
//               sx={{
//                 maxHeight: 200,
//                 overflowY: "auto",
//                 borderTop: "1px solid #e0e0e0",
//               }}
//             >
//               {category.subCategories.length > 0 ? (
//                 <List>
//                   {category.subCategories.map((subCategory) => (
//                     <ListItem
//                       key={subCategory._id}
//                       sx={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         padding: 0,
//                       }}
//                     >
//                       <ListItemText primary={subCategory.name} />
//                       <PrimaryButton
//                         disabled={isRevoking}
//                         title="Disable"
//                         handleSubmit={() => disableSubCategory(subCategory._id)}
//                         isLoading={isRevoking}
//                       />
//                     </ListItem>
//                   ))}
//                 </List>
//               ) : (
//                 <span>No subcategories available</span>
//               )}
//             </AccordionDetails>
//           </Accordion>
//         ))
//       ) : (
//         <span>No data to display</span>
//       )}

//       <MuiModal
//         open={isModalOpen}
//         onClose={() => setModalOpen(false)}
//         title="Add Sub Category"
//       >
//         <form
//           onSubmit={handleSubmit(handleAddSubCategory)}
//           className="flex flex-col items-center gap-6"
//         >
//           <FormControl sx={{ width: "80%" }} error={!!errors.categoryName}>
//             <InputLabel>Select Category</InputLabel>
//             <Controller
//               name="assetCategoryId"
//               control={control}
//               defaultValue=""
//               rules={{ required: "Category Name is required" }}
//               render={({ field }) => (
//                 <Select {...field} label="Select Category">
//                   {assetsCategories
//                     .filter((category) => category.isActive) // Only include active categories
//                     .map((category) => (
//                       <MenuItem key={category._id} value={category._id}>
//                         {category.categoryName}
//                       </MenuItem>
//                     ))}
//                 </Select>
//               )}
//             />
//             {errors.categoryName && (
//               <FormHelperText>{errors.categoryName.message}</FormHelperText>
//             )}
//           </FormControl>

//           <Controller
//             name="assetSubCategoryName"
//             control={control}
//             defaultValue=""
//             rules={{ required: "Sub Category Name is required" }}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="Sub Category Name"
//                 variant="outlined"
//                 sx={{ width: "80%" }}
//                 error={!!errors.subCategoryName}
//                 helperText={errors.subCategoryName?.message}
//               />
//             )}
//           />

//           <PrimaryButton
//             title="Submit"
//             handleSubmit={handleSubmit(handleAddSubCategory)}
//             isLoading={isCreateSubCategory}
//             disabled={isCreateSubCategory}
//           />
//         </form>
//       </MuiModal>
//     </Box>
//   );
// };

// export default AssetsSubCategories;

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import { queryClient } from "../../../main";

const AssetsSubCategories = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { mutate: disableCategory, isPending: isRevoking } = useMutation({
    mutationFn: async (assetCatgoryId) => {
      const response = await axios.patch(
        `/api/assets/disable-asset-category/${assetCatgoryId}`
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["assetCategories"]);
    },
    onError: (error) => {
      // toast.error(error.response.data.message || "Failed to disable category");
      toast.error("Access Required To Disable.");
    },
  });

  const categoriesColumn = [
    { field: "subCategoryName", headerName: "Sub-Category Name", flex: 3 },
    { field: "categoryName", headerName: "Category Name", flex: 3 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      cellRenderer: (params) => {
        if (!params.data.isActive) {
          return null; // Hide button if isActive is false
        }

        return (
          <div className="p-2">
            <PrimaryButton
              title="Disable"
              isLoading={isRevoking}
              disabled={isRevoking}
              handleSubmit={() => {
                disableCategory(params.data.mongoId);
              }}
            />
          </div>
        );
      },
    },
  ];

  // const { data: assetsCategories = [], isPending: assetPending } = useQuery({
  //   queryKey: ["assetsCategories"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("/api/assets/get-category");
  //       return response.data;
  //     } catch (error) {
  //       throw new Error(error.response.data.message);
  //     }
  //   },
  // });

  const { data: assetsCategories = [], isPending: assetPending } = useQuery({
    queryKey: ["assetsCategories"],
    queryFn: async () => {
      return [
        {
          _id: "1",
          categoryName: "Electronics",
          subCategoryName: "Laptops",
          isActive: true,
        },
        {
          _id: "2",
          categoryName: "Electronics",
          subCategoryName: "LAN Cables",
          isActive: true,
        },
        {
          _id: "3",
          categoryName: "Stationery",
          subCategoryName: "Notebooks",
          isActive: true,
        },
        {
          _id: "4",
          categoryName: "Stationery",
          subCategoryName: "Pens",
          isActive: true,
        },
      ];
    },
  });

  const { mutate: createAsset, isPending: pendingCreate } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/assets/create-asset-category", {
        departmentId: data.department,
        assetCategoryName: data.categoryName,
      });
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetsCategories"] });
      setModalOpen(false);
      reset();
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });

  const handleAddCategory = (data) => {
    // Add API call here
    createAsset(data);
  };

  const getRowStyle = (params) => {
    if (!params.data.isActive) {
      return { backgroundColor: "#d3d3d3", color: "#666" }; // Gray out disabled rows
    }
    return null;
  };

  return (
    <>
      <AgTable
        key={assetsCategories.length}
        search={true}
        searchColumn="Category Name"
        tableTitle="Asset Sub Categories"
        buttonTitle="Add Category"
        handleClick={() => setModalOpen(true)}
        data={
          assetPending
            ? []
            : assetsCategories.map((category, index) => ({
                id: index + 1,
                mongoId: category._id,
                subCategoryName: category.subCategoryName,
                categoryName: category.categoryName,
                isActive: category.isActive,
              }))
        }
        columns={categoriesColumn}
        tableHeight={350}
        getRowStyle={getRowStyle}
      />

      <MuiModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Category">
        <form
          onSubmit={handleSubmit(handleAddCategory)}
          className="flex flex-col items-center gap-6 w-full">
          {/* Category Name Input */}
          <Controller
            name="categoryName"
            control={control}
            defaultValue=""
            rules={{ required: "Category Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category Name"
                fullWidth
                size="small"
                variant="outlined"
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
              />
            )}
          />
          <Controller
            name="department"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl size="small" fullWidth>
                <InputLabel>Department</InputLabel>
                <Select {...field} label="Department">
                  <MenuItem value="">Select Department</MenuItem>
                  {auth.user.company.selectedDepartments.length > 0 ? (
                    auth.user.company.selectedDepartments.map((dep) => (
                      <MenuItem
                        key={dep.department._id}
                        value={dep.department._id}>
                        {dep.department.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Locations Available</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          />

          <PrimaryButton
            title="Submit"
            disabled={pendingCreate}
            isLoading={pendingCreate}
          />
        </form>
      </MuiModal>
    </>
  );
};

export default AssetsSubCategories;
