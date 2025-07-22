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

const ListOfAssets = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedForEdit, setSelectedForEdit] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const departmentId = useSelector((state) => state.assets.selectedDepartment);

  //---------------------Forms----------------------//
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
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
      location: "",
      floor: "",
      warrantyDocument: null,
    },
    mode: "onChange",
  });
  const selectedCategory = watch("categoryId");
  const selectedLocation = watch("location");
  const selectedUnit = watch("floor");
  //---------------------Forms----------------------//

  //-----------------------API----------------------//
  const { data: assetsList = [], isPending: isAssetsListPending } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/assets/get-assets?departmentId=${departmentId}`
        );
        const filtered = response.data.flatMap((item) => item.assets);
        return filtered;
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
          const response = await axios.get(
            `/api/assets/get-subcategory?departmentId=${departmentId}`
          );
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
      formData.append("departmentId", departmentId);
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("vendorId", data.vendorId);
      formData.append("name", data.name);
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
      toast.error(error.message);
    },
  });
  useEffect(() => {
    console.log("selected Asset : ", selectedAsset)
    const selected = assetsList.find((item) => item._id === selectedAsset?._id);
    if (selected) {
      setSelectedForEdit(selected);
    }
  }, [selectedAsset, assetsList]);

  useEffect(() => {
    if (modalMode === "edit" && selectedForEdit) {
      editRequest({
        departmentId: selectedForEdit?.department?._id || "",
        categoryId: selectedForEdit?.category?._id || "",
        subCategoryId: selectedForEdit?.subCategory?.subCategoryName || "",
        vendorId: selectedForEdit?.vendor?._id || "",
        name: selectedForEdit?.name || "",
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
        location: selectedForEdit?.location || "",
        floor: selectedForEdit?.floor?._id || "",
        assetImage: null,
        warrantyDocument: null,
      });
    }
  }, [modalMode, selectedForEdit]);

  const { mutate: editAsset, isPending: isUpdateAsset } = useMutation({
    mutationKey: ["editAsset"],
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("departmentId", departmentId);
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("vendorId", data.vendorId);
      formData.append("name", data.name);
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
      toast.error(error.message);
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

  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");

      return response.data;
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;
    const unit = units.find(
      (unit) =>
        unit.unitNo === selectedUnit &&
        unit.building?.buildingName === selectedLocation // use ?. here too
    );
    return unit ? unit._id : null;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building?._id ?? `unknown-${loc.unitNo}`,
            loc.building?.buildingName ?? "Unknown Building",
          ])
        : []
    ).entries()
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

      <MuiModal
        open={isModalOpen}
        title={modalMode === "add" ? "Add Asset" : "Edit Asset"}
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
                  label="Price"
                  error={!!errors.price}
                  helperText={errors?.price?.message}
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
                  label="Warranty (Months)"
                  error={!!errors.warranty}
                  helperText={errors?.warranty?.message}
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
              name="rentedMonths"
              control={control}
              rules={{ required: "Rented Months is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  fullWidth
                  type="number"
                  label="Rented Months"
                  error={!!errors.rentedMonths}
                  helperText={errors?.rentedMonths?.message}
                />
              )}
            />
            <Controller
              name="tangable"
              control={control}
              rules={{ required: "Tangable is required" }}
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
                        unit.building.buildingName === selectedLocation
                    )
                    .map((unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.unitNo}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
            <Controller
              name="assetImage"
              control={control}
              render={({ field }) => (
                <UploadFileInput
                  value={field.value}
                  label="Asset Image"
                  onChange={field.onChange}
                />
              )}
            />

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
            onSubmit={handleEditSubmit((data) => editAsset(data))}
            className="grid grid-cols-2 gap-4"
          >
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
              name="tangable"
              control={editControl}
              rules={{ required: "Tangable is required" }}
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
              name="assetImage"
              control={editControl}
              rules={{ required: "Asset Image is required" }}
              render={({ field }) => (
                <UploadFileInput
                  value={field.value}
                  label="Asset Image"
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="warrantyDocument"
              control={editControl}
              rules={{ required: "Warranty Document is required" }}
              render={({ field }) => (
                <UploadFileInput
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
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted title={""} detail={""} />
          </div>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default ListOfAssets;
