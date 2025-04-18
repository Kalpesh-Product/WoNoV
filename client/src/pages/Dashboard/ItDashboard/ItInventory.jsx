import { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
// import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import { inrFormat } from "../../../utils/currencyFormat";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";

const ItInventory = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
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

  const assetsList = [
    {
      department: { name: "IT" },
      name: "Laptop",
      brand: "Dell",
      price: 60000,
      quantity: 5,
      purchaseDate: new Date().toISOString(),
      warranty: 24,
      vendor: { name: "TechVendor Pvt Ltd" },
    },
    {
      department: { name: "Admin" },
      name: "Printer",
      brand: "HP",
      price: 15000,
      quantity: 2,
      purchaseDate: new Date("2024-12-01").toISOString(),
      warranty: 12,
      vendor: { name: "OfficeNeeds Co" },
    },
    {
      department: { name: "Finance" },
      name: "Monitor",
      brand: "LG",
      price: 12000,
      quantity: 10,
      purchaseDate: new Date("2023-06-15").toISOString(),
      warranty: 18,
      vendor: { name: "GadgetWorld" },
    },
    {
      department: { name: "HR" },
      name: "Projector",
      brand: "Epson",
      price: 45000,
      quantity: 1,
      purchaseDate: new Date("2024-02-20").toISOString(),
      warranty: 24,
      vendor: { name: "AV Solutions" },
    },
    {
      department: { name: "IT" },
      name: "Router",
      brand: "Cisco",
      price: 20000,
      quantity: 3,
      purchaseDate: new Date("2023-11-10").toISOString(),
      warranty: 36,
      vendor: { name: "Network Hub" },
    },
    {
      department: { name: "Admin" },
      name: "Scanner",
      brand: "Canon",
      price: 8000,
      quantity: 4,
      purchaseDate: new Date("2024-03-05").toISOString(),
      warranty: 12,
      vendor: { name: "OfficeNeeds Co" },
    },
    {
      department: { name: "Marketing" },
      name: "Tablet",
      brand: "Samsung",
      price: 25000,
      quantity: 6,
      purchaseDate: new Date("2023-09-01").toISOString(),
      warranty: 18,
      vendor: { name: "GadgetWorld" },
    },
    {
      department: { name: "Finance" },
      name: "Desktop Computer",
      brand: "Lenovo",
      price: 50000,
      quantity: 7,
      purchaseDate: new Date("2024-06-18").toISOString(),
      warranty: 24,
      vendor: { name: "TechVendor Pvt Ltd" },
    },
    {
      department: { name: "HR" },
      name: "Conference Phone",
      brand: "Polycom",
      price: 30000,
      quantity: 1,
      purchaseDate: new Date("2024-01-15").toISOString(),
      warranty: 24,
      vendor: { name: "AV Solutions" },
    },
    {
      department: { name: "IT" },
      name: "External Hard Drive",
      brand: "Seagate",
      price: 7000,
      quantity: 10,
      purchaseDate: new Date("2023-10-10").toISOString(),
      warranty: 12,
      vendor: { name: "Storage Solutions" },
    },
  ];
  

  console.log(vendorDetials);

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
    { field: "department", headerName: "Department" },
    // { field: "assetNumber", headerName: "Asset Number" },
    { field: "category", headerName: "Category" },
    { field: "brand", headerName: "Brand" },
    { field: "price", headerName: "Price (INR)" },
    { field: "quantity", headerName: "Quantity" },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleDetailsClick(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
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

  return (
    <div className="p-4">
      <AgTable
        key={assetsList.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"List Of Inventory"}
        buttonTitle={"Add Inventory"}
        data={[
          ...assetsList.map((asset, index) => ({
            id: index + 1,
            department: asset.department.name,
            category: asset.name,
            brand: asset.brand,
            price: inrFormat(asset.price),
            quantity: asset.quantity,
            purchaseDate: dayjs(asset.purchaseDate).format("DD-MM-YYYY"),
            warranty: asset.warranty,
            vendorName: asset.vendor.name,
          })),
        ]}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />

      <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${modalMode} Details`}>
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
                        } `}
                      >
                        <div
                          className="w-full h-48 flex justify-center items-center relative"
                          style={{
                            backgroundImage: previewImage
                              ? `url(${previewImage})`
                              : "none",
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
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
                            }}
                          >
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
                            }}
                          >
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
                      select
                    >
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
                      size="small"
                    >
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
                      size="small"
                    >
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
                      size="small"
                    >
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

        {modalMode === "view" && selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <DetalisFormatted
              title="Department"
              detail={selectedAsset?.department}
            />
            <DetalisFormatted title="Category" detail={selectedAsset?.category} />
            <DetalisFormatted title="Brand" detail={selectedAsset?.brand} />
            <DetalisFormatted
              title="Price (INR)"
              detail={selectedAsset?.price}
            />
            <DetalisFormatted
              title="Quantity"
              detail={selectedAsset?.quantity}
            />
            <DetalisFormatted
              title="Purchase Date"
              detail={dayjs(selectedAsset?.purchaseDate).format("DD-MM-YYYY")}
            />
            <DetalisFormatted
              title="Warranty (Months)"
              detail={selectedAsset?.warranty}
            />
            <DetalisFormatted
              title="Vendor Name"
              detail={selectedAsset?.vendorName}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default ItInventory;
