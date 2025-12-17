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
import humanDateForamt from "../../../utils/humanDateForamt";
import PageFrame from "../../../components/Pages/PageFrame";

const AdminInventory = () => {
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
    { field: "id", headerName: "Sr No" },
    { field: "department", headerName: "Department" },
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
        <PrimaryButton
          title="Details"
          handleSubmit={() => handleDetailsClick(params.data)}
        />
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

  const mixedInventory = [
    {
      id: 1,
      department: "Admin",
      category: "Electronics",
      brand: "Dell",
      price: 55000,
      quantity: 10,
      purchaseDate: "2024-01-15",
      warranty: 24,
      vendorName: "TechSource Pvt Ltd",
    },
    {
      id: 2,
      department: "IT",
      category: "Furniture",
      brand: "Godrej",
      price: 12000,
      quantity: 5,
      purchaseDate: "2023-12-01",
      warranty: 36,
      vendorName: "OfficeComfort Solutions",
    },
    {
      id: 3,
      department: "HR",
      category: "Stationery",
      brand: "Classmate",
      price: 200,
      quantity: 100,
      purchaseDate: "2024-03-10",
      warranty: 0,
      vendorName: "SmartOffice Supplies",
    },
    {
      id: 4,
      department: "Finance",
      category: "Electronics",
      brand: "HP",
      price: 47000,
      quantity: 7,
      purchaseDate: "2023-11-25",
      warranty: 12,
      vendorName: "Prime IT Distributors",
    },
    {
      id: 5,
      department: "Tech",
      category: "Networking",
      brand: "Cisco",
      price: 18000,
      quantity: 4,
      purchaseDate: "2024-02-05",
      warranty: 24,
      vendorName: "NetConnect Systems",
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
      <PageFrame>
        <AgTable
          key={mixedInventory.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"List Of Inventory"}
          buttonTitle={"Add Inventory"}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add inventory"
      >
        {modalMode === "add" && (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid grid-cols-1 gap-4">
              {/* Category */}
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Category"
                    size="small"
                    select
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    fullWidth
                  >
                    {assetsCategories?.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
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
                    label="Department"
                    size="small"
                    error={!!errors.department}
                    helperText={errors.department?.message}
                    fullWidth
                  />
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
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
                    fullWidth
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
                    label="Price"
                    type="number"
                    size="small"
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    fullWidth
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
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    fullWidth
                  />
                )}
              />

              {/* Purchase Date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="purchaseDate"
                  control={control}
                  rules={{ required: "Purchase date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Purchase Date"
                      format="DD-MM-YYYY"
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!errors.purchaseDate,
                          helperText: errors.purchaseDate?.message,
                          fullWidth: true,
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
                    error={!!errors.warranty}
                    helperText={errors.warranty?.message}
                    fullWidth
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
                    error={!!errors.vendor}
                    helperText={errors.vendor?.message}
                    fullWidth
                  >
                    {vendorDetials?.map((vendor) => (
                      <MenuItem key={vendor._id} value={vendor.name}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            <div className="flex gap-4 justify-center items-center mt-4">
              <PrimaryButton
                title="Submit"
                handleSubmit={() => {
                  toast.success("Added item successfully");
                  setIsModalOpen(false);
                }}
              />
            </div>
          </form>
        )}
      </MuiModal>
    </div>
  );
};

export default AdminInventory;
