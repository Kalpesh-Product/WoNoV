import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
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

const AssetsCategories = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalMode, setModalMode] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const canManageDeleted = canManageDeletedCategories(auth);
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
  }, []);

  //--------------------FORMS------------------------------//

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    setValue,
  } = useForm({
    defaultValues: {
      categoryName: "",
      status: "",
    },
  });
  //--------------------FORMS------------------------------//
  //--------------------API------------------------------//

  const { mutate: createCategory, isPending: pendingCreate } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/assets/create-category", {
        assetCategoryName: data.categoryName,
        departmentId: departmentId,
      });
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      setModalOpen(false);
      reset();
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });
  const { mutate: editCategory, isPending: pendingEdit } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch("/api/assets/update-category", data);
      return response.data;
      // console.log("edit form : ", data);
    },
    onSuccess: function (data) {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      setModalOpen(false);
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });

  const { mutate: deleteCategory, isPending: pendingDelete } = useMutation({
    mutationFn: async (categoryId) =>
      (await axios.delete(`/api/assets/category/${categoryId}`)).data,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      setConfirmationAction(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to delete category"),
  });

  const { mutate: restoreCategory, isPending: pendingRestore } = useMutation({
    mutationFn: async (categoryId) =>
      (await axios.patch(`/api/assets/category/${categoryId}/restore`)).data,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["assetCategories"] });
      setConfirmationAction(null);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to restore category"),
  });

  const { data: assetCategories = [], isPending: isCategoriesPending } =
    useQuery({
     queryKey: ["assetCategories", departmentId, canManageDeleted],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/category/get-category?departmentId=${departmentId}&includeDeleted=${canManageDeleted}`,
          );
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error(error.response?.data?.message || error.message);
          return [];
        }
      },
    });

  //--------------------API------------------------------//

  //--------------------Event handlers------------------------------//

  const handleAddCategory = (data) => {
    // Add API call here
    createCategory(data);
  };
  const handleEdit = (data) => {
    setModalMode("edit");
    setSelectedAsset(data);
    setModalOpen(true);
  };

  useEffect(() => {
    setValue("categoryName", selectedAsset?.categoryName);
    setValue("status", selectedAsset?.isActive);
  }, [selectedAsset, setValue]);

  const getRowStyle = (params) => {
    if (params.data.isDeleted) {
      return { backgroundColor: "#d3d3d3", color: "#666" };
    }
    return null;
  };
  //--------------------Event handlers------------------------------//
  //--------------------Table Data------------------------------//
  const categoriesColumn = [
    { field: "srNo", headerName: "Sr No",width:200 },
    {
      field: "categoryName",
      headerName: "Category Name",
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
      field: "subCategoriesCount",
      headerName: "Sub Categories Count",
       flex: 1,
    },
    {
      field: "assetQuantity",
      headerName: "No. of Assets",
       flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 0.7,
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
  const tableData = isCategoriesPending || !Array.isArray(assetCategories)
    ? []
    : assetCategories.map((item, index) => {
      const status = item.isDeleted
        ? "Deleted"
        : item.isActive
          ? "Active"
          : "Inactive";
      const subCategories = Array.isArray(item.subCategories)
        ? item.subCategories.map((sub) => sub.subCategoryName)
        : [];

      return {
        ...item,
        _id: item._id,
        srNo: index + 1,
        status: status,
        subCategories,
        subCategoriesCount: item?.subCategoriesCount || subCategories.length,
        assetQuantity: item?.assetQuantity || 0,
      };
    });
  //--------------------Table Data------------------------------//

  return (
    <PageFrame>
      <AgTable
        key={tableData._id}
        search={true}
        searchColumn="Category Name"
        tableTitle="Assets Categories"
        buttonTitle="Add Category"
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
            ? "Add Category"
            : modalMode === "view"
              ? "View Category"
              : "Edit Category"
        }
      >
        {modalMode === "add" && (
          <form
            onSubmit={handleSubmit(handleAddCategory)}
            className="grid grid-cols-1 gap-4 w-full"
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
                assetCategoryId: selectedAsset?._id,
                status: data.status === "true",
              };
              editCategory(payload);
            })}
            className="grid grid-cols-1 gap-4 w-full"
          >
            {/* Category Name Input */}
            <Controller
              name="categoryName"
              control={editControl}
              defaultValue=""
              // rules={{ required: "Category Name is required" }}
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
              name="status"
              control={editControl}
              // rules={{ required: "Status is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  fullWidth
                  size="small"
                  label="Select Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
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
              title={"Sub Categories"}
              detail={
                selectedAsset?.subCategories
                  ? [...selectedAsset.subCategories].join(",")
                  : "N/A"
              }
            />
             <DetalisFormatted
              title={"Sub Categories Count"}
              detail={selectedAsset?.subCategoriesCount ?? 0}
            />
            <DetalisFormatted
              title={"No. of Assets"}
              detail={selectedAsset?.assetQuantity ?? 0}
            />
            <DetalisFormatted
              title={"Department"}
              detail={selectedAsset?.department?.name || "N/A"}
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
            ? restoreCategory(confirmationAction.row._id)
            : deleteCategory(confirmationAction?.row._id)
        }
        title={confirmationAction?.type === "restore" ? "Restore Category" : "Delete Category"}
        message={
          confirmationAction?.type === "restore"
            ? "Are you sure you want to restore this category?"
            : canManageDeleted
              ? "Are you sure you want to permanently delete this category?"
              : "Are you sure you want to delete this category?"
        }
        confirmText={confirmationAction?.type === "restore" ? "Restore" : "Delete"}
        isLoading={pendingDelete || pendingRestore}
      />
    </PageFrame>
  );
};

export default AssetsCategories;
