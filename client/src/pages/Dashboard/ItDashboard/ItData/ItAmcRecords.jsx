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
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";
import PageFrame from "../../../../components/Pages/PageFrame";

const ItAmcRecords = () => {
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
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "assetName", headerName: "Asset Name" },
    { field: "department", headerName: "Department" },
    { field: "category", headerName: "Category" },
    { field: "subCategory", headerName: "Sub-Category" }, // Optional
    { field: "brand", headerName: "Brand" },
    { field: "price", headerName: "Price (INR)" },
    { field: "quantity", headerName: "Quantity" },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    { field: "vendorName", headerName: "Vendor Name" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2  flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => {
              const original = assetsList.find(
                (a) => a.name === params.data.assetName
              );
              handleDetailsClick(original);
            }}>
            <MdOutlineRemoveRedEye />
          </span>
        </div>
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
      name: "Dell Latitude 7420",
      department: { name: "IT" },
      category: { categoryName: "Laptop" },
      subCategory: { categoryName: "Business Series" },
      brand: "Dell",
      price: 85000,
      quantity: 10,
      purchaseDate: "2023-06-15T00:00:00Z",
      warranty: 24,
      vendor: { name: "TechZone Pvt Ltd" },
    },
    {
      name: "HP LaserJet Pro M404n",
      department: { name: "IT" },
      category: { categoryName: "Printer" },
      subCategory: { categoryName: "Laser Printer" },
      brand: "HP",
      price: 25000,
      quantity: 3,
      purchaseDate: "2023-03-10T00:00:00Z",
      warranty: 12,
      vendor: { name: "Office Supplies Co." },
    },
    {
      name: "Cisco Catalyst 2960",
      department: { name: "IT" },
      category: { categoryName: "Network Switch" },
      subCategory: { categoryName: "Managed Switch" },
      brand: "Cisco",
      price: 120000,
      quantity: 2,
      purchaseDate: "2022-11-20T00:00:00Z",
      warranty: 36,
      vendor: { name: "NetCom Solutions" },
    },
    {
      name: "APC Smart-UPS 1500VA",
      department: { name: "IT" },
      category: { categoryName: "UPS" },
      subCategory: { categoryName: "Rack-mounted" },
      brand: "APC",
      price: 45000,
      quantity: 4,
      purchaseDate: "2023-01-05T00:00:00Z",
      warranty: 24,
      vendor: { name: "PowerTech India" },
    },
    {
      name: 'MacBook Pro 14" M1',
      department: { name: "IT" },
      category: { categoryName: "Laptop" },
      subCategory: { categoryName: "Developer Machine" },
      brand: "Apple",
      price: 180000,
      quantity: 5,
      purchaseDate: "2023-07-12T00:00:00Z",
      warranty: 12,
      vendor: { name: "iStore India" },
    },
    {
      name: "Lenovo ThinkPad E15",
      department: { name: "IT" },
      category: { categoryName: "Laptop" },
      subCategory: { categoryName: "Engineering" },
      brand: "Lenovo",
      price: 70000,
      quantity: 6,
      purchaseDate: "2022-12-01T00:00:00Z",
      warranty: 24,
      vendor: { name: "Lenovo Authorized Partner" },
    },
    {
      name: "Samsung 32” Monitor",
      department: { name: "IT" },
      category: { categoryName: "Monitor" },
      subCategory: { categoryName: "Wide Screen" },
      brand: "Samsung",
      price: 18000,
      quantity: 8,
      purchaseDate: "2023-08-08T00:00:00Z",
      warranty: 18,
      vendor: { name: "Vision Displays" },
    },
    {
      name: "Microsoft Surface Pro 9",
      department: { name: "IT" },
      category: { categoryName: "Tablet" },
      subCategory: { categoryName: "Business Tablet" },
      brand: "Microsoft",
      price: 140000,
      quantity: 3,
      purchaseDate: "2023-09-25T00:00:00Z",
      warranty: 12,
      vendor: { name: "MS Partner India" },
    },
    {
      name: "Fortinet Firewall 60F",
      department: { name: "IT" },
      category: { categoryName: "Firewall" },
      subCategory: { categoryName: "Enterprise" },
      brand: "Fortinet",
      price: 95000,
      quantity: 1,
      purchaseDate: "2022-10-18T00:00:00Z",
      warranty: 36,
      vendor: { name: "CyberSec Solutions" },
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
    <>
      <PageFrame>
        <AgTable
          key={assetsList.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"AMC Records"}
          buttonTitle={"Add Record"}
          disabled={true}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add Record" : "AMC Details"}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                {/* Asset Image Upload */}

                {/* Asset Name */}
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Asset name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Asset Name"
                      size="small"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                {/* Department */}
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Department"
                      size="small"
                      select
                      fullWidth
                      error={!!errors.department}
                      helperText={errors.department?.message}>
                      {auth.user.company.selectedDepartments?.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Category */}
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      size="small"
                      select
                      fullWidth
                      error={!!errors.categoryId}
                      helperText={errors.categoryId?.message}>
                      {assetsCategories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Sub-Category */}
                <Controller
                  name="subCategoryId"
                  control={control}
                  rules={{ required: "Sub-category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sub-Category"
                      size="small"
                      select
                      fullWidth
                      error={!!errors.subCategoryId}
                      helperText={errors.subCategoryId?.message}>
                      {assetsCategories
                        .flatMap((cat) => cat.subCategories || [])
                        .map((sub) => (
                          <MenuItem key={sub._id} value={sub._id}>
                            {sub.categoryName}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />

                {/* Brand */}
                <Controller
                  name="brand"
                  control={control}
                  rules={{ required: "Brand is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Brand"
                      size="small"
                      fullWidth
                      error={!!errors.brand}
                      helperText={errors.brand?.message}
                    />
                  )}
                />

                {/* Quantity */}
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ required: "Quantity is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                    />
                  )}
                />

                {/* Price */}
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price (INR)"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />

                {/* Purchase Date */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="purchaseDate"
                    control={control}
                    rules={{ required: "Purchase Date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Purchase Date"
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.purchaseDate,
                            helperText: errors.purchaseDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>

                {/* Warranty */}
                <Controller
                  name="warranty"
                  control={control}
                  rules={{ required: "Warranty is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Warranty (Months)"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!errors.warranty}
                      helperText={errors.warranty?.message}
                    />
                  )}
                />

                {/* Vendor */}
                <Controller
                  name="vendor"
                  control={control}
                  rules={{ required: "Vendor is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vendor"
                      size="small"
                      select
                      fullWidth
                      error={!!errors.vendor}
                      helperText={errors.vendor?.message}>
                      {vendorDetials.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-4">
                <PrimaryButton title="Submit" isLoading={isAddingAsset} />
              </div>
            </form>
          </div>
        )}
        {modalMode === "view" && selectedAsset && (
          <div className="p-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <DetalisFormatted
                title="Asset Name"
                detail={selectedAsset.name}
              />
              <DetalisFormatted
                title="Department"
                detail={selectedAsset.department?.name || "N/A"}
              />
              <DetalisFormatted
                title="Category"
                detail={selectedAsset.category?.categoryName || "N/A"}
              />
              <DetalisFormatted
                title="Sub-Category"
                detail={selectedAsset.subCategory?.categoryName || "N/A"}
              />
              <DetalisFormatted title="Brand" detail={selectedAsset.brand} />
              <DetalisFormatted
                title="Price"
                detail={`INR ${Number(selectedAsset.price).toLocaleString(
                  "en-IN"
                )}`}
              />
              <DetalisFormatted
                title="Quantity"
                detail={selectedAsset.quantity}
              />
              <DetalisFormatted
                title="Purchase Date"
                detail={dayjs(new Date(selectedAsset.purchaseDate)).format(
                  "DD-MM-YYYY"
                )}
              />
              <DetalisFormatted
                title="Warranty"
                detail={`${selectedAsset.warranty} months`}
              />
              <DetalisFormatted
                title="Vendor"
                detail={selectedAsset.vendor?.name || "N/A"}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default ItAmcRecords;
