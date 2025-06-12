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
import DetalisFormatted from "../../../../components/DetalisFormatted";
import PageFrame from "../../../../components/Pages/PageFrame";

const ItMonthlyInvoice = () => {
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
    { field: "id", headerName: "Sr No", width: "100" },
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
        <div className="p-2 mb-2  flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleDetailsClick(params.data)}>
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

  // Dummy data for assetsList
  const assetsList = [
    {
      department: { name: "IT" },
      name: "Laptop",
      brand: "Dell",
      price: 65000,
      quantity: 5,
      purchaseDate: "2024-06-15",
      warranty: 24,
      vendor: { name: "Tech Vendor Pvt Ltd" },
    },
    {
      department: { name: "Finance" },
      name: "Printer",
      brand: "HP",
      price: 12000,
      quantity: 2,
      purchaseDate: "2023-11-20",
      warranty: 12,
      vendor: { name: "Office Essentials Ltd" },
    },
    {
      department: { name: "HR" },
      name: "Monitor",
      brand: "Samsung",
      price: 18000,
      quantity: 4,
      purchaseDate: "2024-01-10",
      warranty: 18,
      vendor: { name: "Display World" },
    },
    {
      department: { name: "Admin" },
      name: "Router",
      brand: "TP-Link",
      price: 4000,
      quantity: 3,
      purchaseDate: "2024-03-05",
      warranty: 12,
      vendor: { name: "NetCom Solutions" },
    },
    {
      department: { name: "IT" },
      name: "Desktop",
      brand: "Lenovo",
      price: 55000,
      quantity: 6,
      purchaseDate: "2023-08-01",
      warranty: 36,
      vendor: { name: "Tech Vendor Pvt Ltd" },
    },
    {
      department: { name: "Support" },
      name: "Tablet",
      brand: "Apple",
      price: 70000,
      quantity: 2,
      purchaseDate: "2024-02-18",
      warranty: 12,
      vendor: { name: "iStore India" },
    },
    {
      department: { name: "Marketing" },
      name: "Camera",
      brand: "Canon",
      price: 45000,
      quantity: 1,
      purchaseDate: "2024-04-10",
      warranty: 24,
      vendor: { name: "Visual Gear" },
    },
    {
      department: { name: "Sales" },
      name: "Projector",
      brand: "Epson",
      price: 32000,
      quantity: 1,
      purchaseDate: "2023-10-12",
      warranty: 18,
      vendor: { name: "AV Experts" },
    },
    {
      department: { name: "HR" },
      name: "Phone",
      brand: "OnePlus",
      price: 30000,
      quantity: 4,
      purchaseDate: "2024-05-01",
      warranty: 24,
      vendor: { name: "Mobile Hub" },
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
          tableTitle={"Monthly Invoice Reports"}
          buttonTitle={"Add Invoice"}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add Invoice" : "Asset Details"}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                {/* Image Upload */}

                {/* Category */}
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Category"
                      size="small"
                      error={!!errors.name}
                      helperText={errors.name?.message}>
                      {assetsCategories.map((category) => (
                        <MenuItem
                          key={category._id}
                          value={category.categoryName}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      fullWidth
                      select
                      label="Department"
                      size="small"
                      error={!!errors.department}
                      helperText={errors.department?.message}>
                      {auth.user.company.selectedDepartments?.map((dept) => (
                        <MenuItem key={dept._id} value={dept.name}>
                          {dept.name}
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
                      size="small"
                      {...field}
                      label="Brand"
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
                      size="small"
                      {...field}
                      label="Quantity"
                      type="number"
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
                      size="small"
                      {...field}
                      label="Price"
                      type="number"
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
                            error: !!errors.purchaseDate,
                            helperText: errors?.purchaseDate?.message,
                          },
                        }}
                        className="w-full"
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
                      size="small"
                      {...field}
                      label="Warranty (Months)"
                      type="number"
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
                      fullWidth
                      select
                      label="Vendor"
                      size="small"
                      error={!!errors.vendor}
                      helperText={errors.vendor?.message}>
                      {vendorDetials.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor.name}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>

              {/* Submit button */}
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton
                  title={modalMode === "add" ? "Submit" : "Update"}
                />
              </div>
            </form>
          </div>
        )}
        {modalMode === "view" && selectedAsset && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <DetalisFormatted
                title="Department"
                detail={selectedAsset.department}
              />
              <DetalisFormatted title="Category" detail={selectedAsset.name} />
              <DetalisFormatted title="Brand" detail={selectedAsset.brand} />
              <DetalisFormatted
                title="Price"
                detail={`INR ${selectedAsset.price.toLocaleString("en-IN")}`}
              />
              <DetalisFormatted
                title="Quantity"
                detail={selectedAsset.quantity}
              />
              <DetalisFormatted
                title="Purchase Date"
                detail={dayjs(selectedAsset.purchaseDate).format("DD-MM-YYYY")}
              />
              <DetalisFormatted
                title="Warranty"
                detail={`${selectedAsset.warranty} months`}
              />
              <DetalisFormatted
                title="Vendor"
                detail={selectedAsset.vendor?.name}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default ItMonthlyInvoice;
