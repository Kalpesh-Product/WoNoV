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
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import PageFrame from "../../../components/Pages/PageFrame";  
import StatusChip from "../../../components/StatusChip";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const AssetsCategories = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [modalMode, setModalMode] = useState("");
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
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
      const response = await axios.post("/api/assets/create-asset-category", {
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
      const response = await axios.patch(
        "/api/assets/update-asset-category",
        data
      );
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

  const { data: assetCategories = [], isPending: isCategoriesPending } =
    useQuery({
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
  }, [selectedAsset]);

  const getRowStyle = (params) => {
    if (!params.data.isActive) {
      return { backgroundColor: "#d3d3d3", color: "#666" }; // Gray out disabled rows
    }
    return null;
  };
  //--------------------Event handlers------------------------------//
  //--------------------Table Data------------------------------//
  const categoriesColumn = [
    { field: "srNo", headerName: "Sr No" },
    {
      field: "categoryName",
      headerName: "Category Name",
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
  const tableData = isCategoriesPending
    ? []
    : assetCategories.map((item, index) => {
        const status = item.isActive ? "Active" : "Inactive";
        const subCategories = item.subCategories.map((sub)=> sub.subCategoryName)

        return {
          ...item,
          _id: item._id,
          srNo: index + 1,
          status: status,
          subCategories
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
        // getRowStyle={getRowStyle}
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
              detail={selectedAsset?.subCategories ? [...selectedAsset.subCategories].join(","): "N/A"}
            />
            <DetalisFormatted
              title={"Department"}
              detail={selectedAsset?.department?.name || "N/A"}
            />
          </div>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default AssetsCategories;
