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
      return [];
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
        title="Add Category"
      >
        <form
          onSubmit={handleSubmit(handleAddCategory)}
          className="flex flex-col items-center gap-6 w-full"
        >
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
                        value={dep.department._id}
                      >
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
