import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Button,
  CircularProgress,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import PageFrame from "../../../components/Pages/PageFrame";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { inrFormat } from "../../../utils/currencyFormat";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import { useSelector } from "react-redux";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import { useMemo } from "react";
import UploadFileInput from "../../../components/UploadFileInput";
import { queryClient } from "../../../main";
import dayjs from "dayjs";
import DetalisFormatted from "../../../components/DetalisFormatted";
import humanDate from "../../../utils/humanDateForamt";
import { useNavigate } from "react-router-dom";
import StatusChip from "../../../components/StatusChip";

const ListOfAssets = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);
  const navigate = useNavigate();

  //---------------------Forms----------------------//
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue: setAddValue,
    setError,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: {
      departmentId: "",
      categoryId: "",
      subCategoryId: "",
      vendorId: "",
      name: "",
      serialNumber: "",
      description: "",
      assetId: "",
      secondaryId: "",
      purchaseDate: null,
      quantity: 0,
      price: 0,
      brand: "",
      totalPrice: 0,
      assetType: "",
      warranty: 0,
      warrantyExpiryDate: null,
      ownershipType: "",
      rentedMonths: 0,
      rentedExpirationDate: null,
      tangable: "",
      locationId: "",
      location: "",
      floor: "",
      warrantyDocument: null,
    },
    mode: "onChange",
  });
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    formState: { errors: editErrors },
    watch: editWatch,
    reset: editRequest,
    setValue,
     setError: setEditError,
    clearErrors: clearEditErrors,
  } = useForm({
    defaultValues: {
      departmentId: "",
      categoryId: "",
      subCategoryId: "",
      vendorId: "",
      name: "",
      serialNumber: "",
      description: "",
      assetId: "",
      secondaryId: "",
      purchaseDate: null,
      quantity: 0,
      price: 0,
      brand: "",
      totalPrice: 0,
      assetType: "",
      warranty: 0,
      warrantyExpiryDate: null,
      ownershipType: "",
      rentedMonths: 0,
      rentedExpirationDate: null,
      tangable: "",
      locationId: "",
      location: "",
      floor: "",
      isDamaged: "",
      isUnderMaintenance: "",
      status: "",
      assetImage: null,
      warrantyDocument: null,
    },
    mode: "onChange",
  });
  const selectedCategory = watch("categoryId");
  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");
  const watchedPurchaseDate = watch("purchaseDate");
  const watchedQuantity = watch("quantity");
  const watchedPrice = watch("price");
  const watchedWarranty = watch("warranty");
  const watchedOwnershipType = watch("ownershipType");
  const watchedRentedMonths = watch("rentedMonths");

  //---------------------Forms----------------------//

  //-----------------------API----------------------//
  const { data: assetsList = [], isPending: isAssetsListPending } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-assets?departmentId=${departmentId}`,
        );
        const filtered = Array.isArray(response.data)
          ? response.data.flatMap((item) => item?.assets || [])
          : [];
        return filtered;
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
  });

  const { data: assetSubCategories = [], isPending: isSubCategoriesPending } =
    useQuery({
      queryKey: ["assetSubCategories"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/assets/get-subcategory?departmentId=${departmentId}`,
          );
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error(error.response?.data?.message || error.message);
          return [];
        }
      },
    });
  const filteredSubCategories = !selectedCategory
    ? []
    : assetSubCategories?.filter(
        (item) => item.category?._id === selectedCategory,
      ) || [];

  const { data: vendorDetails = [], isPending: isVendorDetails } = useQuery({
    queryKey: ["vendorDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/vendors/get-vendors/${departmentId}`,
        );
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
  });
  const activeVendorDetails = vendorDetails.filter(
    (item) => item?.status === "Active",
  );
  const { mutate: addAsset, isPending: isAddingAsset } = useMutation({
    mutationKey: ["addAsset"],
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("departmentId", data.departmentId || departmentId);
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("vendorId", data.vendorId);
      formData.append("name", data.name);
      formData.append("serialNumber", data.serialNumber || "");
      formData.append("description", data.description || "");
      formData.append("assetId", data.assetId);
      formData.append("secondaryId", data.secondaryId || "");
      formData.append("isDamaged", data.isDamaged);
      formData.append("isUnderMaintenance", data.isUnderMaintenance);
      formData.append("status", data.status);
      formData.append("purchaseDate", data.purchaseDate);
      formData.append("quantity", Number(data.quantity));
      formData.append("price", Number(data.price));
      formData.append("brand", data.brand);
      formData.append("assetType", data.assetType);
      formData.append("warranty", Number(data.warranty));
      formData.append("ownershipType", data.ownershipType);
      formData.append("rentedMonths", Number(data.rentedMonths));
      formData.append("tangable", data.tangable);
      formData.append("locationId", data.floor);
      if (data.assetImage) {
        formData.append("assetImage", data.assetImage);
      }
      if (data.warrantyDocument) {
        formData.append("warrantyDocument", data.warrantyDocument);
      }

      const response = await axios.post("/api/assets/create-asset", formData);
      return response.data;
    },
    onSuccess: function (data) {
      queryClient.invalidateQueries({ queryKey: ["assetsList"] });
      toast.success(data.message);
      setIsModalOpen(false);
      reset();
    },
    onError: function (error) {
      // toast.error(error.message);
       toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add asset",
      );
    },
  });
  useEffect(() => {
    const totalPrice =
      (Number(watchedQuantity) || 0) * (Number(watchedPrice) || 0);
    setAddValue("totalPrice", totalPrice, { shouldValidate: true });

    if (watchedPurchaseDate && Number(watchedWarranty) > 0) {
      setAddValue(
        "warrantyExpiryDate",
        dayjs(watchedPurchaseDate)
          .add(Number(watchedWarranty), "month")
          .toISOString(),
        { shouldValidate: true },
      );
    } else {
      setAddValue("warrantyExpiryDate", null, { shouldValidate: true });
    }

    if (
      watchedOwnershipType === "Rental" &&
      watchedPurchaseDate &&
      Number(watchedRentedMonths) > 0
    ) {
      setAddValue(
        "rentedExpirationDate",
        dayjs(watchedPurchaseDate)
          .add(Number(watchedRentedMonths), "month")
          .toISOString(),
        { shouldValidate: true },
      );
    } else {
      setAddValue("rentedExpirationDate", null, { shouldValidate: true });
    }
  }, [
    watchedQuantity,
    watchedPrice,
    watchedPurchaseDate,
    watchedWarranty,
    watchedOwnershipType,
    watchedRentedMonths,
    setAddValue,
  ]);

  useEffect(() => {
    const selected = assetsList.find((item) => item._id === selectedAsset?._id);
    if (selected) {
      setSelectedForEdit(selected);
    }
  }, [selectedAsset, assetsList]);

  useEffect(() => {
    console.log("status", selectedForEdit.status);
    if (modalMode === "edit" && selectedForEdit) {
      editRequest({
        assetMongoId: selectedForEdit?._id || "",
        departmentId: selectedForEdit?.department?._id || "",
        categoryId: selectedForEdit?.subCategory?.category?._id || "",
        subCategoryId: selectedForEdit?.subCategory?.subCategoryName || "",
        subCatId: selectedForEdit?.subCategory?._id || "",
        vendorId: selectedForEdit?.vendor?._id || "",
        name: selectedForEdit?.name || "",
        serialNumber: selectedForEdit?.serialNumber || "",
        description: selectedForEdit?.description || "",
        assetId: selectedForEdit?.assetId || "",
        secondaryId: selectedForEdit?.secondaryId || "",
        purchaseDate: selectedForEdit?.purchaseDate || null,
        quantity: selectedForEdit?.quantity || 0,
        price: selectedForEdit?.price || 0,
        brand: selectedForEdit?.brand || "",
        assetType: selectedForEdit?.assetType || "",
        warranty: selectedForEdit?.warranty || 0,
        ownershipType: selectedForEdit?.ownershipType || "",
        rentedMonths: selectedForEdit?.rentedMonths || 0,
        tangable:
          typeof selectedForEdit?.tangable === "boolean"
            ? String(selectedForEdit.tangable)
            : "",
        locationId: selectedForEdit?.location?._id || "",
        floor: selectedForEdit?.floor?._id || "",
        isUnderMaintenance:
          typeof selectedForEdit?.isUnderMaintenance === "boolean"
            ? String(selectedForEdit.isUnderMaintenance)
            : "",
        status: selectedForEdit?.status === "Active" ? "Active" : "Inactive",
        isDamaged:
          typeof selectedForEdit?.isDamaged === "boolean"
            ? String(selectedForEdit.isDamaged)
            : "",
        // assetImage: null,
         assetImage: selectedForEdit?.assetImage?.url || null,
        warrantyDocument: null,
      });
    }
  }, [modalMode, selectedForEdit]);

  const { mutate: editAsset, isPending: isUpdateAsset } = useMutation({
    mutationKey: ["editAsset"],
    mutationFn: async (data) => {
      console.log("data for edit", data);
      const formData = new FormData();
      formData.append("departmentId", data.departmentId || departmentId);
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subCatId);
      formData.append("vendorId", data.vendorId);
      formData.append("name", data.name);
      formData.append("serialNumber", data.serialNumber || "");
      formData.append("description", data.description || "");
      formData.append("assetId", data.assetId);
      formData.append("secondaryId", data.secondaryId || "");
      formData.append("purchaseDate", data.purchaseDate);
      formData.append("quantity", Number(data.quantity));
      formData.append("price", Number(data.price));
      formData.append("brand", data.brand);
      formData.append("assetType", data.assetType);
      formData.append("warranty", Number(data.warranty));
      formData.append("ownershipType", data.ownershipType);
      formData.append("rentedMonths", Number(data.rentedMonths));
      formData.append("status", data.status);
      formData.append("isDamaged", data.isDamaged);
      formData.append("isUnderMaintenance", data.isUnderMaintenance);
      formData.append("tangable", data.tangable);
      formData.append("locationId", data.locationId);

      if (data.assetImage) {
        formData.append("assetImage", data.assetImage);
      }
      if (data.warrantyDocument) {
        formData.append("warrantyDocument", data.warrantyDocument);
      }

      const response = await axios.patch(
        `/api/assets/update-asset/${data.assetMongoId}`,
        formData,
      );
      return response.data;
    },
    onSuccess: function (data) {
      queryClient.invalidateQueries({ queryKey: ["assetsList"] });
      toast.success(data.message);
      setIsModalOpen(false);
      reset();
    },
    onError: function (error) {
      // toast.error(error.message);
        toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update asset",
      );
    },
  });

  const { data: assetCategories = [], isPending: isCategoriesPending } =
    useQuery({
      queryKey: ["assetCategories"],
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

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-simple-units");
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error(error.response?.data?.message || error.message);
        return [];
      }
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;
    const unit = units.find(
      (unit) =>
        unit.unitNo === selectedUnit &&
        unit.building?.buildingName === selectedLocation, // use ?. here too
    );
    return unit ? unit._id : null;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building?._id ??
              (loc.unitNo
                ? `unknown-${loc.unitNo}`
                : `unknown-${Math.random()}`),
            loc.building?.buildingName ?? "Unknown Building",
          ])
        : [],
    ).entries(),
  );
  //-----------------------API----------------------//
  //-----------------------Event handlers----------------------//
  const handleView = (asset) => {
    setSelectedAsset(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setIsModalOpen(true);
    setModalMode("add");
    setSelectedAsset(null);
  };
  const handleEdit = (data) => {
    setIsModalOpen(true);
    setModalMode("edit");
    setSelectedAsset(data);
  };
  //-----------------------Event handlers----------------------//
  //-----------------------Table Data----------------------//
  const assetColumns = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
    { field: "assetId", headerName: "Asset Id" },
    { field: "secondaryId", headerName: "Secondary Id" },
    // { field: "department", headerName: "Department" },
    { field: "subCategory", headerName: "Sub-Category" },
    { field: "brand", headerName: "Brand" },
    // {
    //   field: "price",
    //   headerName: "Price (INR)",
    //   cellRenderer: (params) => inrFormat(params.value),
    // },
    // { field: "purchaseDate", headerName: "Purchase Date" },
    // { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "warrantyExpiryDate",
      headerName: "Warranty Expiry Date",
      cellRenderer: (params) => humanDate(params.value),
    },
    // {
    //   field: "rentedExpirationDate",
    //   headerName: "Rental Expiry Date",
    //   cellRenderer: (params) => (params.value ? humanDate(params.value) : "N/A"),
    // },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => <StatusChip status={params.value || "N/A"} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "View",
              onClick: () => handleView(params.data),
            },
            {
              label: "Edit",
              onClick: () => handleEdit(params.data),
            },
          ]}
        />
      ),
    },
  ];
  const addedByName = useMemo(() => {
    if (selectedAsset?.createdBy?.firstName) {
      return `${selectedAsset.createdBy.firstName} ${selectedAsset?.createdBy?.lastName || ""}`.trim();
    }

    if (selectedAsset?.createdBy?.name) return selectedAsset.createdBy.name;

    if (auth?.user?.firstName) {
      return `${auth.user.firstName} ${auth?.user?.lastName || ""}`.trim();
    }

    return auth?.user?.name || "N/A";
  }, [selectedAsset, auth]);
  const tableData =
    isAssetsListPending || !Array.isArray(assetsList)
      ? []
      : assetsList.map((item) => {
          return {
            ...item,
            assetMongoId: item?.asset?._id,
            department: item?.department?.name || "N/A",
            subCategory: item?.subCategory?.subCategoryName || "N/A",
            subCatId: item?.subCategory?._id,
            categoryId: item?.subCategory?.category?._id,
            category: item?.subCategory?.category?.categoryName || "N/A",
          };
        });
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

      <MuiModal
        open={isModalOpen}
        title={
          modalMode === "add"
            ? "Add Asset"
            : modalMode === "view"
              ? "View Details"
              : "Edit Asset"
        }
        onClose={() => setIsModalOpen(false)}
      >
        {modalMode === "add" && (
          <form
            onSubmit={handleSubmit((data) => addAsset(data))}
            className="grid grid-cols-2 gap-4"
          >
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
                  disabled={!selectedCategory}
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
                  onChange={(event) => {
                    const selectedValue = event.target.value;

                    if (selectedValue === "add_vendor") {
                      // Open in new tab (blank page)
                      window.open(
                        "/app/assets/mix-bag/vender/vendor-onboard",
                        "_blank",
                      );

                      // Reset the dropdown after navigation
                      setTimeout(() => {
                        event.target.value = "";
                      }, 0);

                      return;
                    }

                    field.onChange(event);
                  }}
                  size="small"
                  fullWidth
                  label="Vendor"
                  error={!!errors.vendorId}
                  helperText={errors?.vendorId?.message}
                >
                  <MenuItem value="add_vendor">
                    <em>Add Vendor</em>
                  </MenuItem>
                  {isVendorDetails
                    ? []
                    : activeVendorDetails.map((item) => (
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
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset Name"
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                />
              )}
            />
            <Controller
              name="purchaseDate"
              control={control}
              rules={{ required: "Purchase date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD-MM-YYYY"
                  label="Purchase Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.purchaseDate,
                      helperText: errors?.purchaseDate?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="quantity"
              control={control}
              rules={{ required: "Quantity is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Quantity"
                  error={!!errors.quantity}
                  helperText={errors?.quantity?.message}
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{ required: "Price is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Per Quantity Price"
                  error={!!errors.price}
                  helperText={errors?.price?.message}
                />
              )}
            />
            <Controller
              name="totalPrice"
              control={control}
              rules={{ required: "Price is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Total Price"
                  disabled
                  error={!!errors.totalPrice}
                  helperText={errors?.totalPrice?.message}
                />
              )}
            />
            <Controller
              name="brand"
              control={control}
              rules={{
                required: "Brand is required",
                validate: { isAlphanumeric, noOnlyWhitespace },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset brand"
                  error={!!errors.brand}
                  helperText={errors?.brand?.message}
                />
              )}
            />
            <Controller
              name="assetType"
              control={control}
              rules={{ required: "Asset Type is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset Type"
                  error={!!errors.assetType}
                  helperText={errors?.assetType?.message}
                >
                  <MenuItem value="" disabled>
                    <em>Select an Asset Type</em>
                  </MenuItem>
                  <MenuItem value="Physical">Physical</MenuItem>
                  <MenuItem value="Digital">Digital</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="warranty"
              control={control}
              rules={{ required: "Warranty is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Warranty in Months"
                  error={!!errors.warranty}
                  helperText={errors?.warranty?.message}
                />
              )}
            />
            <Controller
              name="warrantyExpiryDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD-MM-YYYY"
                  label="Warranty Expiry Date"
                  disabled
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.warrantyExpiryDate,
                      helperText: errors?.warrantyExpiryDate?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="ownershipType"
              control={control}
              rules={{ required: "Ownership Type is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Ownership Type"
                  error={!!errors.ownershipType}
                  helperText={errors?.ownershipType?.message}
                >
                  <MenuItem value="" disabled>
                    <em>Select an Ownership Type</em>
                  </MenuItem>
                  <MenuItem value="Owned">Owned</MenuItem>
                  <MenuItem value="Rental">Rental</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="tangable"
              control={control}
              rules={{ required: "Tangible is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Tangible"
                  error={!!errors.tangable}
                  helperText={errors?.tangable?.message}
                >
                  <MenuItem value="" disabled>
                    <em>Select Tangable</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="rentedMonths"
              control={control}
              rules={{
                validate: (value) =>
                  watch("ownershipType") !== "Rental" ||
                  Number(value) > 0 ||
                  "Rented Months is required for Rental assets",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Rented for Months"
                  disabled={watch("ownershipType") !== "Rental"}
                  error={!!errors.rentedMonths}
                  helperText={errors?.rentedMonths?.message}
                />
              )}
            />
            <Controller
              name="rentedExpirationDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD-MM-YYYY"
                  label="Rented Expiration Date"
                  disabled
                  value={field.value ? dayjs(field.value) : null}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.rentedExpirationDate,
                      helperText: errors?.rentedExpirationDate?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              rules={{ required: "Building is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors?.location?.message}
                  label="Building"
                >
                  <MenuItem value="" disabled>
                    Select Building
                  </MenuItem>
                  {locationsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : locationsError ? (
                    <MenuItem disabled>Error fetching units</MenuItem>
                  ) : (
                    uniqueBuildings.map(([id, name]) => (
                      <MenuItem key={id} value={name}>
                        {name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            {/* Meeting Room Dropdown */}
            <Controller
              name="floor"
              control={control}
              rules={{ required: "Unit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Unit"
                  size="small"
                  fullWidth
                  disabled={!selectedLocation}
                  value={field.value}
                  error={!!errors.floor}
                  helperText={errors?.floor?.message}
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select Unit
                  </MenuItem>
                  {units
                    .filter(
                      (unit) =>
                        unit.building &&
                        unit.building.buildingName === selectedLocation,
                    )
                    .map((unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.unitNo}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <div className="col-span-2">
              <Controller
                name="assetImage"
                control={control}
                render={({ field }) => (
                  <UploadFileInput
                    value={field.value}
                    label="Asset Image"
                    // onChange={field.onChange}
                    allowedExtensions={["jpeg", "jpg", "png"]}
                    error={!!errors.assetImage}
                    helperText={errors.assetImage?.message}
                    onInvalidFile={() =>
                      setError("assetImage", {
                        type: "manual",
                        message:
                          "Invalid file format. Allowed formats: image/jpeg, image/png",
                      })
                    }
                    onChange={(file) => {
                      clearErrors("assetImage");
                      field.onChange(file);
                    }}
                  />
                )}
              />
            </div>

            <PrimaryButton
              title={"Add Asset"}
              type={"submit"}
              isLoading={isAddingAsset}
              disabled={isAddingAsset}
              externalStyles={"col-span-2"}
            />
          </form>
        )}
        {modalMode === "edit" && (
          <form
            onSubmit={handleEditSubmit((data) =>
              editAsset({
                ...data,
                isDamaged: data.isDamaged === "true" ? true : false,
                isUnderMaintenance:
                  data.isUnderMaintenance === "true" ? true : false,
              }),
            )}
            className="grid grid-cols-2 gap-4"
          >
            <Controller
              name="assetId"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset ID"
                  disabled
                  error={!!editErrors.assetId}
                  helperText={editErrors?.assetId?.message}
                />
              )}
            />
            <Controller
              name="secondaryId"
              control={editControl}
              rules={{
                validate: (value) =>
                  !value ||
                  noOnlyWhitespace(value) === true ||
                  "Enter a valid Secondary ID",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Secondary ID"
                  error={!!editErrors.secondaryId}
                  helperText={editErrors?.secondaryId?.message}
                />
              )}
            />
            <Controller
              name="name"
              control={editControl}
              rules={{
                required: "Name is required",
                validate: { isAlphanumeric, noOnlyWhitespace },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset Name"
                  error={!!editErrors.name}
                  helperText={editErrors?.name?.message}
                />
              )}
            />
            <Controller
              name="serialNumber"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Serial Number"
                  error={!!editErrors.serialNumber}
                  helperText={editErrors?.serialNumber?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={editControl}
              rules={{
                validate: (value) =>
                  !value ||
                  value.trim().split(/\s+/).filter(Boolean).length <= 1000 ||
                  "Description must be 1000 words or less",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  error={!!editErrors.description}
                  helperText={editErrors?.description?.message}
                />
              )}
            />
            <Controller
              name="purchaseDate"
              control={editControl}
              rules={{ required: "Purchase date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD-MM-YYYY"
                  label="Purchase Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date ? date.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!editErrors.purchaseDate,
                      helperText: editErrors?.purchaseDate?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="price"
              control={editControl}
              rules={{ required: "Price is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Price"
                  error={!!editErrors.price}
                  helperText={editErrors?.price?.message}
                />
              )}
            />
            <Controller
              name="brand"
              control={editControl}
              rules={{
                required: "Brand is required",
                validate: { isAlphanumeric, noOnlyWhitespace },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset brand"
                  error={!!editErrors.brand}
                  helperText={editErrors?.brand?.message}
                />
              )}
            />
            <Controller
              name="rentedMonths"
              control={editControl}
              rules={{ required: "Rented Months is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Rented Months"
                  error={!!editErrors.rentedMonths}
                  helperText={editErrors?.rentedMonths?.message}
                />
              )}
            />
            <Controller
              name="warranty"
              control={editControl}
              rules={{ required: "Warranty is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Warranty (Months)"
                  error={!!editErrors.warranty}
                  helperText={editErrors?.warranty?.message}
                />
              )}
            />
            <Controller
              name="ownershipType"
              control={editControl}
              rules={{ required: "Ownership Type is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Ownership Type"
                >
                  <MenuItem value="" disabled>
                    <em>Select an Ownership Type</em>
                  </MenuItem>
                  <MenuItem value="Owned">Owned</MenuItem>
                  <MenuItem value="Rental">Rental</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="assetType"
              control={editControl}
              rules={{ required: "Asset Type is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Asset Type"
                >
                  <MenuItem value="" disabled>
                    <em>Select an Asset Type</em>
                  </MenuItem>
                  <MenuItem value="Physical">Physical</MenuItem>
                  <MenuItem value="Digital">Digital</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="tangable"
              control={editControl}
              rules={{ required: "Tangible is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Tangable"
                >
                  <MenuItem value="" disabled>
                    <em>Select Tangable</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="status"
              control={editControl}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Status"
                >
                  <MenuItem value="" disabled>
                    <em>Select Status</em>
                  </MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="isDamaged"
              control={editControl}
              rules={{ required: "Damaged is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Damaged"
                >
                  <MenuItem value="" disabled>
                    <em>Select Damaged</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="isUnderMaintenance"
              control={editControl}
              rules={{ required: "Under Maintenance is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  size="small"
                  fullWidth
                  label="Under Maintenance"
                >
                  <MenuItem value="" disabled>
                    <em>Select Under Maintenance</em>
                  </MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="assetImage"
              control={editControl}
              // rules={{ required: "Asset Image is required" }}
              render={({ field }) => (
                <UploadFileInput
                  id="asset-image"
                  value={field.value}
                  label="Asset Image"
                 // onChange={field.onChange}
                   previewType="image"
                  allowedExtensions={["jpeg", "jpg", "png"]}
                  error={!!editErrors.assetImage}
                  helperText={editErrors.assetImage?.message}
                  onInvalidFile={() =>
                    setEditError("assetImage", {
                      type: "manual",
                      message:
                        "Invalid file format. Allowed formats: image/jpeg, image/png",
                    })
                  }
                  onChange={(file) => {
                    clearEditErrors("assetImage");
                    field.onChange(file);
                  }}
                />
              )}
            />
            <Controller
              name="warrantyDocument"
              control={editControl}
              // rules={{ required: "Warranty Document is required" }}
              render={({ field }) => (
                <UploadFileInput
                  id="warranty-document"
                  value={field.value}
                  label="Warranty Document"
                  allowedExtensions={["pdf"]}
                  onChange={field.onChange}
                />
              )}
            />

            <PrimaryButton
              title={"Update Asset"}
              type={"submit"}
              isLoading={isUpdateAsset}
              disabled={isUpdateAsset}
              externalStyles={"col-span-2"}
            />
          </form>
        )}
        {/* {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted title={""} detail={""} />
          </div>
        )} */}
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Asset ID"}
              detail={selectedAsset?.assetId || "N/A"}
            />
            <DetalisFormatted
              title={"Secondary ID"}
              detail={selectedAsset?.secondaryId || "N/A"}
            />
            <DetalisFormatted
              title={"Asset Name"}
              detail={selectedAsset?.name || "N/A"}
            />
            <DetalisFormatted
              title={"Serial Number"}
              detail={selectedAsset?.serialNumber || "N/A"}
            />
            <DetalisFormatted
              title={"Description"}
              detail={selectedAsset?.description || "N/A"}
            />
            <DetalisFormatted
              title={"Added At"}
              detail={
                selectedAsset?.createdAt
                  ? humanDate(selectedAsset?.createdAt)
                  : "N/A"
              }
            />
            <DetalisFormatted title={"Added By"} detail={addedByName} />
            <DetalisFormatted
              title={"Asset Type"}
              detail={selectedAsset?.assetType || "N/A"}
            />
            <DetalisFormatted
              title={"Brand"}
              detail={selectedAsset?.brand || "N/A"}
            />
            <DetalisFormatted
              title={"Department"}
              detail={selectedAsset?.department || "N/A"}
            />
            <DetalisFormatted
              title={"UnitNo"}
              detail={selectedAsset?.location?.unitNo || "N/A"}
            />
            <DetalisFormatted
              title={"Ownership Type"}
              detail={selectedAsset?.ownershipType || "N/A"}
            />
            <DetalisFormatted
              title={"Price"}
              detail={`INR ${inrFormat(selectedAsset?.price)}`}
            />
            <DetalisFormatted
              title={"Quantity"}
              detail={selectedAsset?.quantity ?? 1}
            />
            <DetalisFormatted
              title={"Purchase Date"}
              detail={humanDate(selectedAsset?.purchaseDate)}
            />
            <DetalisFormatted
              title={"Warranty Expiry Date"}
              detail={
                selectedAsset?.warrantyExpiryDate
                  ? humanDate(selectedAsset?.warrantyExpiryDate)
                  : "N/A"
              }
            />
            <DetalisFormatted
              title={"Rental Expiry Date"}
              detail={
                selectedAsset?.rentedExpirationDate
                  ? humanDate(selectedAsset?.rentedExpirationDate)
                  : "N/A"
              }
            />
            <DetalisFormatted
              title={"Category"}
              detail={selectedAsset?.category || "N/A"}
            />
            <DetalisFormatted
              title={"Sub Category"}
              detail={selectedAsset?.subCategory || "N/A"}
            />
            <DetalisFormatted
              title={"Tangible"}
              detail={selectedAsset?.tangable ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Status"}
              detail={selectedAsset?.status || "N/A"}
            />

            <DetalisFormatted
              title={"Under Maintenance"}
              detail={selectedAsset?.isUnderMaintenance ? "Yes" : "No"}
            />

            <DetalisFormatted
              title={"Damaged"}
              detail={selectedAsset?.isDamaged ? "Yes" : "No"}
            />
            <DetalisFormatted
              title={"Assigned"}
              detail={selectedAsset?.isAssigned ? "Yes" : "No"}
            />

            <DetalisFormatted
              title={"Asset Image"}
              detail={
                selectedAsset?.assetImage?.url ? (
                  <a
                    className="text-primary underline cursor-pointer"
                    href={selectedAsset.assetImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Asset Image
                  </a>
                ) : (
                  "N/A"
                )
              }
            />

            <DetalisFormatted
              title={"Warranty Document"}
              detail={
                selectedAsset?.warrantyDocument?.link ? (
                  <a
                    className="text-primary underline cursor-pointer"
                    href={selectedAsset.warrantyDocument.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Warranty Document
                  </a>
                ) : (
                  "N/A"
                )
              }
            />
          </div>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default ListOfAssets;
