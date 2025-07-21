import { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { inrFormat } from "../../../utils/currencyFormat";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { useSelector } from "react-redux";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";

const ListOfAssets = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);

  //---------------------Forms----------------------//
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      departmentId: "",
      categoryId: "",
      subCategoryId: "",
      vendorId: "",
      name: "",
      purchaseDate: null,
      quantity: 0,
      price: 0,
      brand: "",
      assetType: "",
      warranty: 0,
      ownershipType: "",
      rentedMonths: 0,
      tangable: "",
      locationId: "",
    },
  });
  const selectedCategory = watch("categoryId");
  //---------------------Forms----------------------//

  //-----------------------API----------------------//
  const { data: assetsList = [], isPending: isAssetsListPending } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-assets");
        const filtered = response.data.flatMap((item) => item.assets);
        return filtered;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const { data: assetsCategories = [], isPending: assetPending } = useQuery({
    queryKey: ["assetsCategories"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-category");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: assetSubCategories = [], isPending: isSubCategoriesPending } =
    useQuery({
      queryKey: ["assetSubCategories"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/assets/get-subcategory");
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });
  const filteredSubCategories = !selectedCategory
    ? []
    : assetSubCategories?.filter(
        (item) => item.category?._id === selectedCategory
      ) || [];

  const { data: vendorDetails = [], isPending: isVendorDetails } = useQuery({
    queryKey: ["vendorDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/vendors/get-vendors/${departmentId}`
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const { mutate: addAsset, isPending: isAddingAsset } = useMutation({
    mutationKey: ["addAsset"],
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("assetType", data.assetType);
      formData.append("vendor", data.vendor);
      formData.append("purchaseDate", data.purchaseDate);
      formData.append("quantity", Number(data.quantity));
      formData.append("price", Number(data.price));
      formData.append("warranty", Number(data.warranty));
      if (data.image) {
        formData.append("image", data.image);
      }
      formData.append("brand", data.brand);
      formData.append("department", data.department);
      formData.append("status", data.status);
      formData.append("assignedTo", data.assignedTo);

      const response = await axios.post("/api/assets/create-asset");
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      setIsModalOpen(false);
    },
    onError: function (error) {
      toast.error(error.message);
    },
  });
  const { data: assetCategories = [], isPending: isCategoriesPending } =
    useQuery({
      queryKey: ["assetCategories"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/assets/get-category");
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });
  //-----------------------API----------------------//
  //-----------------------Event handlers----------------------//
  const handleDetailsClick = (asset) => {
    setSelectedAsset(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setIsModalOpen(true);
    setModalMode("add");
    setSelectedAsset(null);
  };

  const handleFormSubmit = (data) => {
    if (modalMode === "add") {
      addAsset(data);
    }
  };
  //-----------------------Event handlers----------------------//
  //-----------------------Table Data----------------------//
  const assetColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "assetId", headerName: "Asset Id" },
    { field: "department", headerName: "Department" },
    { field: "subCategory", headerName: "Sub-Category" },
    { field: "brand", headerName: "Brand" },
    {
      field: "price",
      headerName: "Price (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "Edit",
              // onClick: () => handleEdit(params.data),
            },
            {
              label: "Assign",
              // onClick: () => handleDelete(params.data),
            },
          ]}
        />
      ),
    },
  ];

  const tableData = isAssetsListPending
    ? []
    : assetsList.map((item) => ({
        ...item,
        department: item?.department?.name,
        subCategory: item?.subCategory?.subCategoryName,
      }));
  //-----------------------Table Data----------------------//

  return (
    <PageFrame>
      <YearWiseTable
        search={true}
        dateColumn={"purchaseDate"}
        tableTitle={"List of Assets"}
        buttonTitle={"Add Asset"}
        data={tableData}
        columns={assetColumns}
        handleSubmit={handleAddAsset}
      />

      <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "add" && (
          <form className="grid grid-cols-2 gap-4">
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  error={!!errors.categoryId}
                  helperText={errors?.categoryId?.message}
                  label="Category"
                >
                  <MenuItem value="" disabled>
                    <em>Select a Category</em>
                  </MenuItem>
                  {isCategoriesPending
                    ? []
                    : assetCategories.map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          {item.categoryName}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            />
            <Controller
              name="subCategoryId"
              control={control}
              rules={{ required: "Sub Category is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  error={!!errors.subCategoryId}
                  helperText={errors?.subCategoryId?.message}
                  label="Sub Category"
                >
                  <MenuItem value="" disabled>
                    <em>Select a Sub Category</em>
                  </MenuItem>
                  {filteredSubCategories?.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.subCategoryName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="vendorId"
              control={control}
              rules={{ required: "Vendor is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Vendor"
                >
                  <MenuItem value="" disabled>
                    <em>Select a Vendor</em>
                  </MenuItem>
                  {isVendorDetails
                    ? []
                    : vendorDetails.map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          {item.companyName || item.name}
                        </MenuItem>
                      ))}
                </TextField>
              )}
            />
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Name is required",
                validate: { isAlphanumeric, noOnlyWhitespace },
              }}
            />
          </form>
        )}
        {modalMode === "edit" && ""}
      </MuiModal>
    </PageFrame>
  );
};

export default ListOfAssets;
