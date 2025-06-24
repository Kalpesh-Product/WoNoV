import { useEffect, useState } from "react";
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
import { inrFormat } from "../../../../utils/currencyFormat";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import PageFrame from "../../../../components/Pages/PageFrame";

const AdminMonthlyInvoiceReports = () => {
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

  const invoiceColumns = [
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

  const { data: assetsList = [] } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-assets");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const invoiceData = [
    {
      department: { name: "Admin" },
      name: "Office Chair",
      brand: "Godrej Interio",
      price: 8500,
      quantity: 10,
      purchaseDate: "2024-04-12",
      warranty: 24,
      vendor: { name: "Comfort Seating Co." },
    },
    {
      department: { name: "Admin" },
      name: "Laser Printer",
      brand: "Brother",
      price: 14000,
      quantity: 2,
      purchaseDate: "2024-06-18",
      warranty: 18,
      vendor: { name: "Print Solutions Pvt Ltd" },
    },
    {
      department: { name: "Admin" },
      name: "Filing Cabinet",
      brand: "DurableStore",
      price: 6000,
      quantity: 5,
      purchaseDate: "2024-08-08",
      warranty: 36,
      vendor: { name: "Office Interiors Ltd" },
    },
    {
      department: { name: "Admin" },
      name: "Wi-Fi Router",
      brand: "Netgear",
      price: 4500,
      quantity: 3,
      purchaseDate: "2024-07-20",
      warranty: 24,
      vendor: { name: "NetCom Solutions" },
    },
    {
      department: { name: "Admin" },
      name: "Work Desk",
      brand: "Featherlite",
      price: 9000,
      quantity: 6,
      purchaseDate: "2024-09-30",
      warranty: 48,
      vendor: { name: "Urban Office Supplies" },
    },
    {
      department: { name: "Admin" },
      name: "Reception Sofa Set",
      brand: "Nilkamal",
      price: 30000,
      quantity: 1,
      purchaseDate: "2024-11-10",
      warranty: 60,
      vendor: { name: "FurniStyle India" },
    },
    {
      department: { name: "Admin" },
      name: "Coffee Machine",
      brand: "Nescafe",
      price: 15000,
      quantity: 1,
      purchaseDate: "2025-01-15",
      warranty: 12,
      vendor: { name: "PantryPlus Services" },
    },
    {
      department: { name: "Admin" },
      name: "Document Shredder",
      brand: "Kores",
      price: 10000,
      quantity: 1,
      purchaseDate: "2025-02-02",
      warranty: 24,
      vendor: { name: "SecureDocs India" },
    },
    {
      department: { name: "Admin" },
      name: "Visitor Register Tablet",
      brand: "Samsung",
      price: 28000,
      quantity: 2,
      purchaseDate: "2025-03-20",
      warranty: 24,
      vendor: { name: "Digital Gateways" },
    },
  ];

  // const invoiceData = []

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
          key={invoiceData.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"Monthly Invoice Reports"}
          buttonTitle={"Add Invoice"}
          data={[]}
          columns={invoiceColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add Invoice" : "Invoice Details"}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
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
                        <MenuItem key={dept._id} value={dept.name}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Category */}
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Category"
                      size="small"
                      error={!!errors.category}
                      helperText={errors.category?.message}>
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

                {/* Price */}
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Price (INR)"
                      type="number"
                      error={!!errors.price}
                      helperText={errors.price?.message}
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

                {/* Vendor Name */}
                <Controller
                  name="vendor"
                  control={control}
                  rules={{ required: "Vendor is required" }}
                  render={({ field }) => (
                    <TextField
                      select
                      {...field}
                      label="Vendor Name"
                      size="small"
                      error={!!errors.vendor}
                      helperText={errors.vendor?.message}
                      fullWidth>
                      {vendorDetials.map((vendor) => (
                        <MenuItem key={vendor._id} value={vendor.name}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton title="Submit" />
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
              <DetalisFormatted
                title="Category"
                detail={selectedAsset.category}
              />
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
                detail={selectedAsset.vendorName}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default AdminMonthlyInvoiceReports;
