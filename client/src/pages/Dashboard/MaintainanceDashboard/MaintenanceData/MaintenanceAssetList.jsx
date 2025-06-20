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
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../../../components/Pages/PageFrame";

const MaintenanceAssetList = (disabled) => {
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
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "department", headerName: "Department" },
    { field: "inventoryNumber", headerName: "Inventory Number" },
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
        <div
          onClick={() => {
            handleDetailsClick(params.data);
          }}
          className="hover:bg-gray-200 cursor-pointer p-2 px-0 rounded-full transition-all w-1/4 flex justify-center">
          <span className="text-subtitle">
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
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 45000,
      quantity: 2,
      purchaseDate: "11-11-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0002",
      category: "Chair",
      brand: "Ergosphere",
      price: 50000,
      quantity: 3,
      purchaseDate: "10-10-2024",
      warranty: 24,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0003",
      category: "Chair",
      brand: "Ergosphere",
      price: 120000,
      quantity: 1,
      purchaseDate: "12-09-2024",
      warranty: 36,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0004",
      category: "Chair",
      brand: "Ergosphere",
      price: 40000,
      quantity: 4,
      purchaseDate: "01-08-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0005",
      category: "Chair",
      brand: "Ergosphere",
      price: 60000,
      quantity: 5,
      purchaseDate: "15-07-2024",
      warranty: 18,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 65000,
      quantity: 2,
      purchaseDate: "27-11-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 65000,
      quantity: 2,
      purchaseDate: "21-11-2024",
      warranty: 12,
    },
    {
      department: "IT",
      inventoryNumber: "0006",
      category: "Laptop",
      brand: "Dell",
      price: 75000,
      quantity: 5,
      purchaseDate: "05-12-2024",
      warranty: 36,
    },
    {
      department: "Finance",
      inventoryNumber: "0007",
      category: "Printer",
      brand: "HP",
      price: 25000,
      quantity: 2,
      purchaseDate: "18-11-2024",
      warranty: 12,
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
          tableTitle={"Asset List"}
          buttonTitle={"Add Asset"}
          disabled={disabled}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "view" ? "View Details" : "Add Inventory"}>
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
                      size="small"
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
        {modalMode === "view" && selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 px-2 py-4">
            <DetalisFormatted
              title="Department"
              detail={selectedAsset.department}
            />
            <DetalisFormatted
              title="Inventory Number"
              detail={selectedAsset.inventoryNumber}
            />
            <DetalisFormatted
              title="Category"
              detail={selectedAsset.category}
            />
            <DetalisFormatted title="Brand" detail={selectedAsset.brand} />
            <DetalisFormatted
              title="Price"
              detail={`INR ${selectedAsset.price}`}
            />
            <DetalisFormatted
              title="Quantity"
              detail={selectedAsset.quantity}
            />
            <DetalisFormatted
              title="Purchase Date"
              detail={selectedAsset.purchaseDate}
            />
            <DetalisFormatted
              title="Warranty (Months)"
              detail={selectedAsset.warranty}
            />
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default MaintenanceAssetList;
