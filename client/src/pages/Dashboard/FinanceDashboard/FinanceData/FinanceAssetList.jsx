import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
// import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../../hooks/useAuth";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";

const FinanceAssetList = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewDetails, setViewDetails] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      assetType: "",
      vendor: "",
      purchaseDate: null,
      quantity: null,
      price: null,
      warranty: null,
      image: null,
      brand: "",
      department: "",
      status: "",
      assignedTo: "",
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
  const { data: vendorDetials = [], isPending: isVendorDetails } = useQuery({
    queryKey: ["vendorDetials"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/vendors/get-vendors");
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

  const assetColumns = [
    { field: "id", headerName: "Sr No" },
    // { field: "department", headerName: "Department" },
    // { field: "assetNumber", headerName: "Asset Number" },
    { field: "category", headerName: "Category" },
    { field: "brand", headerName: "Brand" },
    { field: "price", headerName: "Price" },
    { field: "quantity", headerName: "Quantity" },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
        <div className="flex gap-2 items-center">
          <div
             
            className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
          >
            <span className="text-subtitle cursor-pointer" onClick={() => handleViewModal(params.data)}>
              <MdOutlineRemoveRedEye />
            </span>
          </div>
        </div>
      </>
      ),
    },
  ];

  // const { data: assetsList = [] } = useQuery({
  //   queryKey: ["assetsList"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("/api/assets/get-assets");
  //       return response.data;
  //     } catch (error) {
  //       throw new Error(error.response.data.message);
  //     }
  //   },
  // });

  const assetsList = [
    {
      id: 1,
      department: { name: "Finance" },
      name: "Dell Latitude 7420",
      brand: "Dell",
      price: 85000,
      quantity: 5,
      purchaseDate: "2023-04-10",
      warranty: 24,
      vendor: { name: "Dell Technologies" },
    },
    {
      id: 2,
      department: { name: "Finance" },
      name: "Tally ERP 9 License",
      brand: "Tally Solutions",
      price: 18000,
      quantity: 2,
      purchaseDate: "2023-06-15",
      warranty: 12,
      vendor: { name: "Tally Solutions Pvt. Ltd." },
    },
    {
      id: 3,
      department: { name: "Finance" },
      name: "QuickBooks License",
      brand: "Intuit",
      price: 24000,
      quantity: 1,
      purchaseDate: "2023-05-20",
      warranty: 12,
      vendor: { name: "QuickBooks India" },
    },
    {
      id: 4,
      department: { name: "Finance" },
      name: "Canon D1620 Printer",
      brand: "Canon",
      price: 32000,
      quantity: 1,
      purchaseDate: "2023-03-30",
      warranty: 18,
      vendor: { name: "Canon India" },
    },
    {
      id: 5,
      department: { name: "Finance" },
      name: "NAS Storage Server",
      brand: "Synology",
      price: 65000,
      quantity: 1,
      purchaseDate: "2023-07-05",
      warranty: 36,
      vendor: { name: "TechServe Solutions" },
    },
    {
      id: 6,
      department: { name: "Finance" },
      name: "UPS Backup Unit",
      brand: "APC",
      price: 18000,
      quantity: 2,
      purchaseDate: "2023-08-01",
      warranty: 24,
      vendor: { name: "APC Power Solutions" },
    },
    {
      id: 7,
      department: { name: "Finance" },
      name: "HP EliteDesk Desktop",
      brand: "HP",
      price: 72000,
      quantity: 4,
      purchaseDate: "2023-09-10",
      warranty: 36,
      vendor: { name: "HP World" },
    },
    {
      id: 8,
      department: { name: "Finance" },
      name: "MS Excel Pro Plus License",
      brand: "Microsoft",
      price: 12000,
      quantity: 5,
      purchaseDate: "2023-10-25",
      warranty: 12,
      vendor: { name: "Microsoft India" },
    },
  ];
  
  

  const handleDetailsClick = (asset) => {
    setSelectedAsset(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (modalMode === "add") {
      addAsset(data);
    }
  };

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  return (
    <>
      <AgTable
        key={assetsList.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Asset List"}
        buttonTitle={"Add Asset"}
        data={[
          ...assetsList.map((asset, index) => ({
            id: index + 1,
            // department: asset.department.name,
            category: asset.name,
            brand: asset.brand,
            price: Number(asset.price.toLocaleString("en-IN").replace(/,/g, "")).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            quantity: asset.quantity,
            purchaseDate: dayjs(asset.purchaseDate).format("DD-MM-YYYY"),
            warranty: asset.warranty,
            vendorName: asset.vendor.name,
          })),
        ]}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />

{viewDetails && <ViewDetailsModal
open={viewModalOpen}
onClose={() => setViewModalOpen(false)}
data={{...viewDetails,price:"INR " + Number(
  viewDetails.price.toLocaleString("en-IN").replace(/,/g, "")
).toLocaleString("en-IN", { maximumFractionDigits: 0 })
}}
title="Statutory Payment Detail"
fields={[
  { label: "Category", key: "category" },
  { label: "Brand", key: "brand" },
  { label: "Price", key: "price" },
  { label: "Quantity", key: "quantity" },
  { label: "Purchase Date", key: "purchaseDate" },
  { label: "Warranty (Months)", key: "warranty" },
]}
/>}

      <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Controller
                    name="image"
                    control={control}
                    rules={{ required: "Asset image is required" }}
                    render={({ field }) => (
                      <div
                        {...field}
                        className={`w-full flex justify-center border-2 rounded-md p-2 relative ${
                          errors.assetImage
                            ? "border-red-500"
                            : "border-gray-300"
                        } `}>
                        <div
                          className="w-full h-48 flex justify-center items-center relative"
                          style={{
                            backgroundImage: previewImage
                              ? `url(${previewImage})`
                              : "none",
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              backgroundColor: "rgba(255, 255, 255, 0.7)",
                              color: "#000",
                              fontSize: "16px",
                              fontWeight: "bold",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                            }}>
                            Select Image
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                if (e.target.files.length > 0) {
                                  field.onChange(e.target.files);
                                  setPreviewImage(previewImage);
                                } else {
                                  field.onChange(null);
                                }
                              }}
                            />
                          </Button>
                        </div>
                        {errors.assetImage && (
                          <FormHelperText
                            error
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              margin: 0,
                            }}>
                            {errors.assetImage.message}
                          </FormHelperText>
                        )}
                      </div>
                    )}
                  />
                </div>
                <Controller
                  name="assetType"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Asset Type"
                      helperText={!!errors.assetType?.message}
                      select>
                      <MenuItem value="">Select an Asset Type</MenuItem>
                      <MenuItem value="Physical">Physical</MenuItem>
                      <MenuItem value="Digital">Digital</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <TextField
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      fullWidth
                      {...field}
                      select
                      label="Department"
                      size="small">
                      {auth.user.company.selectedDepartments?.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="categoryId"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Category"
                      size="small">
                      {assetsCategories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="subCategoryId"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Sub-Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Sub-Category"
                      size="small">
                      {assetsCategories.subCategories?.map((subCategory) => (
                        <MenuItem key={subCategory._id} value={subCategory._id}>
                          {subCategory.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Department & Category */}
                <Controller
                  name="brand"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Brand is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Brand Name"
                      error={!!errors.brand}
                      helperText={errors.brand?.message}
                    />
                  )}
                />
                {/* Quantity & Price */}
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: "Quantity is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Quantity"
                      type="number"
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                    />
                  )}
                />

                <Controller
                  name="price"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Price"
                      type="number"
                      className=""
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />

                {/* <Controller
              name="vendor"
              control={control}
              defaultValue=""
              rules={{ required: "Vendor Name is required" }}
              render={({ field }) => (
                <TextField
                  select
                  {...field}
                  label="Vendor Name"
                  size="small"
                  error={!!errors.department}
                  helperText={errors.department?.message}
                  fullWidth>
                  {vendorDetials.map((vendor) => (
                    <MenuItem key={vendor} value={vendor}>
                      {vendor}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            /> */}
                {/* Purchase Date & Warranty */}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="purchaseDate"
                    control={control}
                    defaultValue={null}
                    rules={{ required: "Purchase Date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Purchase Date"
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!errors.purchaseDate,
                            helperText: errors?.purchaseDate?.message,
                          },
                        }}
                        className="w-full"
                      />
                    )}
                  />
                </LocalizationProvider>

                <Controller
                  name="warranty"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Warranty is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Warranty (Months)"
                      type="number"
                      error={!!errors.warranty}
                      helperText={errors.warranty?.message}
                    />
                  )}
                />
                <FormHelperText>{errors.category?.message}</FormHelperText>
              </div>
              {/* Main end div*/}
              {/* Conditionally render submit/edit button */}
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton
                  title={modalMode === "add" ? "Submit" : "Update"}
                />
                {/* Cancel button for edit mode */}
              </div>
            </form>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default FinanceAssetList;
