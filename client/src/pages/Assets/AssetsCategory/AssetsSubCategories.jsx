import { useMemo, useState } from "react";
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
import PageFrame from "../../../components/Pages/PageFrame";
import StatusChip from "../../../components/StatusChip";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";

const canManageDeletedCategories = (auth) =>
  (auth?.user?.departments || []).some(
    (department) =>
      ["67b2cf85b9b6ed5cedeb9a2e", "6798ba9de469e809084e2494"].includes(
        String(department?._id || department),
      ) || ["Top Management", "Tech Department"].includes(department?.name),
  );

const AssetsSubCategories = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalMode, setModalMode] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const canManageDeleted = canManageDeletedCategories(auth);

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
      const response = await axios.post("/api/assets/create-subcategory", {
        ...data,
        assetSubCategoryName: data.subCategoryName,
      });
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
      queryKey: ["assetSubCategories", departmentId, canManageDeleted],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/assets/get-subcategory?departmentId=${departmentId}&includeDeleted=${canManageDeleted}`,
          );
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error(error.response?.data?.message || error.message);
          return [];
        }
      },
    });

  const { data: assetCategories = [], isPending: isCategoriesPending } = useQuery({
   queryKey: ["assetCategories", departmentId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/category/get-category?departmentId=${departmentId}`,
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        return [];
      }
    },
  });

  const { mutate: editSubCategory, isPending: pendingEdit } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        "/api/assets/update-subcategory",
        data,
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

  const { mutate: deleteSubCategory, isPending: pendingDelete } = useMutation({
    mutationFn: async (subCategoryId) =>
      (await axios.delete(`/api/assets/subcategory/${subCategoryId}`)).data,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetSubCategories"] });
      setConfirmationAction(null);
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Failed to delete sub-category",
      ),
  });

  const { mutate: restoreSubCategory, isPending: pendingRestore } = useMutation({
    mutationFn: async (subCategoryId) =>
      (await axios.patch(`/api/assets/subcategory/${subCategoryId}/restore`)).data,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetSubCategories"] });
      setConfirmationAction(null);
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Failed to restore sub-category",
      ),
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
    if (params.data.isDeleted) {
      return { backgroundColor: "#d3d3d3", color: "#666" };
    }
    return null;
  };

  useEffect(() => {
    setValue("subCategoryName", selectedAsset?.subCategoryName);
    setValue("status", selectedAsset?.isActive);
  }, [selectedAsset, setValue]);
  //--------------------Event handlers------------------------------//
  //--------------------Table Data------------------------------//
  const categoriesColumn = [
    { field: "srNo", headerName: "Sr No" ,width:200},
    { field: "categoryName", headerName: "Category",flex:1 },
    //   {
    //   field: "subCategoriesCount",
    //   headerName: "Sub Categories Count",
    // },
    {
      field: "subCategoryName",
      headerName: "Sub Category Name",
      flex: 1,
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
      {
      field: "assetQuantity",
      headerName: "No. of Assets",
      flex:1 
    },
    {
      field: "status",
      headerName: "Status",
      flex:1 ,
      sort: "desc",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.7 ,
      cellRenderer: (params) => {
        return (
          <div className="flex items-center gap-1">
            {params.data.isDeleted ? (
              <button
                type="button"
                title="Restore"
                className="h-8 w-8 flex items-center justify-center text-black hover:text-primary"
                onClick={() =>
                  setConfirmationAction({ type: "restore", row: params.data })
                }
              >
                <MdOutlineRestore size={26} />
              </button>
            ) : (
              <button
                type="button"
                title="Edit"
                className="h-8 w-8 flex items-center justify-center text-black hover:text-primary"
                onClick={() => handleEdit(params.data)}
              >
                <HiPencilSquare size={26} />
              </button>
            )}
            {params.data.isActive && (
              <button
                type="button"
                title={params.data.isDeleted ? "Delete permanently" : "Delete"}
                className="h-8 w-8 flex items-center justify-center text-red-600 hover:text-red-700"
                onClick={() =>
                  setConfirmationAction({ type: "delete", row: params.data })
                }
              >
                <MdDeleteForever size={26} />
              </button>
            )}
          </div>
        );
      },
    },
  ];
  const tableData = isSubCategoriesPending || !Array.isArray(assetSubCategories)
    ? []
    : assetSubCategories.map((item, index) => {
      const status = item.isDeleted
        ? "Deleted"
        : item.isActive
          ? "Active"
          : "Inactive";
      return {
        ...item,
        _id: item._id,
        srNo: index + 1,
        status: status,
        categoryName: item?.category?.categoryName || "N/A",
         assetQuantity: item?.assetQuantity || 0,
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
        getRowStyle={getRowStyle}
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
              title={"Category"}
              detail={selectedAsset?.categoryName || "N/A"}
            />
            <DetalisFormatted
              title={"Sub Category"}
              detail={selectedAsset?.subCategoryName || "N/A"}
            />
            {/* <DetalisFormatted
              title={"Sub Categories Count"}
              detail={selectedAsset?.subCategoriesCount ?? 0}
            /> */}
             <DetalisFormatted
              title={"No. of Assets"}
              detail={selectedAsset?.assetQuantity ?? 0}
            />
            {selectedAsset?.isDeleted && (
              <DetalisFormatted
                title={"Deleted By"}
                detail={
                  `${selectedAsset?.deletedBy?.firstName || ""} ${selectedAsset?.deletedBy?.lastName || ""}`.trim() ||
                  "N/A"
                }
              />
            )}
          </div>
        )}
      </MuiModal>
      <ConfirmationModal
        open={Boolean(confirmationAction)}
        onClose={() => setConfirmationAction(null)}
        onConfirm={() =>
          confirmationAction?.type === "restore"
            ? restoreSubCategory(confirmationAction.row._id)
            : deleteSubCategory(confirmationAction?.row._id)
        }
        title={
          confirmationAction?.type === "restore"
            ? "Restore Sub-Category"
            : "Delete Sub-Category"
        }
        message={
          confirmationAction?.type === "restore"
            ? "Are you sure you want to restore this sub-category?"
            : canManageDeleted
              ? "Are you sure you want to permanently delete this sub-category?"
              : "Are you sure you want to delete this sub-category?"
        }
        confirmText={confirmationAction?.type === "restore" ? "Restore" : "Delete"}
        isLoading={pendingDelete || pendingRestore}
      />
    </PageFrame>
  );
};

export default AssetsSubCategories;
