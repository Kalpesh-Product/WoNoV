import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  CircularProgress,
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
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import PageFrame from "../../../components/Pages/PageFrame";
import StatusChip from "../../../components/StatusChip";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const AssetsSubCategories = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalMode, setModalMode] = useState("");
  const departmentId = useSelector((state) => state.assets.selectedDepartment);

  //--------------------FORMS------------------------------//

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      subCategoryName: "",
      assetCategoryId: "",
    },
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: editReset,
    setValue,
  } = useForm({
    defaultValues: {
      subCategoryName: "",
      assetCategoryId: "",
      status: "",
    },
  });
  //--------------------FORMS------------------------------//
  //--------------------API------------------------------//
  const { mutate: createSubCategory, isPending: pendingCreate } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
      const response = await axios.post(
        "/api/assets/create-asset-subcategory",
        { ...data, assetSubCategoryName: data.subCategoryName }
      );
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetSubCategories"] });
      setModalOpen(false);
      reset();
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });

  const { data: assetSubCategories = [], isPending: isSubCategoriesPending } =
    useQuery({
      queryKey: ["assetSubCategories"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/assets/get-subcategory?departmentId=${departmentId}`
          );
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });

  const { data: assetCategories, isPending: isCategoriesPending } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-category?departmentId=${departmentId}`
        );
        return response.data;
      } catch (error) {
        console.error(error.message);
      }
    },
  });

  const { mutate: editSubCategory, isPending: pendingEdit } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        "/api/assets/update-asset-subcategory",
        data
      );
      return response.data;
      // console.log("edit form : ", data);
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetSubCategories"] });
      setModalOpen(false);
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });

  //--------------------API------------------------------//

  //--------------------Event handlers------------------------------//

  const handleAddCategory = (data) => {
    // Add API call here
    createSubCategory(data);
  };

  const handleEdit = (data) => {
    setModalMode("edit");
    setSelectedAsset(data);
    setModalOpen(true);
  };

  const getRowStyle = (params) => {
    if (!params.data.isActive) {
      return { backgroundColor: "#d3d3d3", color: "#666" }; // Gray out disabled rows
    }
    return null;
  };

  useEffect(() => {
    setValue("subCategoryName", selectedAsset?.subCategoryName);
    setValue("status", selectedAsset?.isActive);
  }, [selectedAsset]);
  //--------------------Event handlers------------------------------//
  //--------------------Table Data------------------------------//
  const categoriesColumn = [
    { field: "srNo", headerName: "Sr No" },

    {
      field: "subCategoryName",
      headerName: "Sub Category Name",
      flex: 3,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            setModalMode("view");
            setSelectedAsset(params.data);
            setModalOpen(true);
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "categoryName", headerName: "Category" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <ThreeDotMenu
            rowId={params.data._id}
            menuItems={[
              {
                label: "Edit",
                onClick: () => handleEdit(params.data),
              },
              // {
              //   label: "Delete",
              //   onClick: () => handleDelete(params.data),
              // },
            ]}
          />
        );
      },
    },
  ];
  const tableData = isSubCategoriesPending
    ? []
    : assetSubCategories.map((item, index) => {
        const status = item.isActive ? "Active" : "Inactive";
        return {
          ...item,
          _id: item._id,
          srNo: index + 1,
          status: status,
          categoryName: item?.category?.categoryName,
        };
      });
  //--------------------Table Data------------------------------//

  return (
    <PageFrame>
      <AgTable
        key={tableData._id}
        search={true}
        tableTitle="Assets Sub-Categories"
        buttonTitle="Add Sub-Category"
        handleClick={() => {
          setModalMode("add");
          setModalOpen(true);
        }}
        data={tableData}
        columns={categoriesColumn}
        tableHeight={350}
        // getRowStyle={getRowStyle}
      />

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === "add"
            ? "Add Sub Category"
            : modalMode === "view"
            ? "View Sub Category"
            : "Edit Sub Category"
        }
      >
        {modalMode === "add" && (
          <form
            onSubmit={handleSubmit(handleAddCategory)}
            className="grid grid-cols-1 gap-4 w-full"
          >
            {/* Category Name Input */}
            <Controller
              name="subCategoryName"
              control={control}
              defaultValue=""
              rules={{ required: "Sub Category Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sub-Category Name"
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.subCategoryName}
                  helperText={errors.subCategoryName?.message}
                />
              )}
            />
            <Controller
              name="assetCategoryId"
              control={control}
              rules={{ required: "Asset Category is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  fullWidth
                  label="Category"
                >
                  <MenuItem value="" disabled>
                    <em>Select Asset Category</em>
                  </MenuItem>
                  {isCategoriesPending ? (
                    <div className="flex justify-center items-center">
                      <CircularProgress size={15} />
                    </div>
                  ) : (
                    assetCategories.map((item) => (
                      <MenuItem value={item._id}>{item.categoryName}</MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <PrimaryButton
              title="Submit"
              disabled={pendingCreate}
              isLoading={pendingCreate}
            />
          </form>
        )}

        {modalMode === "edit" && (
          <form
            onSubmit={handleEditSubmit((data) => {
              const payload = {
                ...data,
                assetSubCategoryId: selectedAsset?._id,
                status: data.status === "true",
              };
              editSubCategory(payload);
            })}
            className="grid grid-cols-1 gap-4 w-full"
          >
            {/* Category Name Input */}
            <Controller
              name="subCategoryName"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sub Category Name"
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!editErrors.subCategoryName}
                  helperText={editErrors.subCategoryName?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={editControl}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  fullWidth
                  size="small"
                  label="Select Status"
                  error={!!editErrors.status}
                  helperText={editErrors.status?.message}
                >
                  <MenuItem value="" disabled>
                    Select a status
                  </MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              )}
            />

            <PrimaryButton
              title="Submit"
              disabled={pendingCreate}
              isLoading={pendingCreate}
            />
          </form>
        )}
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Sub Category"}
              detail={selectedAsset?.subCategoryName || "N/A"}
            />
            <DetalisFormatted
              title={"Category"}
              detail={selectedAsset?.categoryName || "N/A"}
            />
          </div>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default AssetsSubCategories;
