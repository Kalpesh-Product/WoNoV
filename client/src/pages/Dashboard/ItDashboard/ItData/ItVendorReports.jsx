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

const ItVendorReports = () => {
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

  const vendorsList = [
    {
      _id: "v1",
      name: "Apple India Pvt Ltd",
      contactPerson: "Ravi Kumar",
      phone: "+91-9876543210",
      email: "ravi.kumar@apple.com",
      address: "Bangalore, Karnataka",
      gstNumber: "29ABCDE1234F2Z5",
      services: ["Hardware Supply", "Warranty Support"],
      rating: 4.8,
    },
    {
      _id: "v2",
      name: "Microsoft Corp",
      contactPerson: "Anita Sharma",
      phone: "+91-9123456789",
      email: "anita@microsoft.com",
      address: "Hyderabad, Telangana",
      gstNumber: "36ABCDE5678G3Z2",
      services: ["Software Licenses", "Cloud Services"],
      rating: 4.6,
    },
    {
      _id: "v3",
      name: "Infosys Technologies",
      contactPerson: "Rajeev Nair",
      phone: "+91-9988776655",
      email: "rajeev@infosys.com",
      address: "Mysore, Karnataka",
      gstNumber: "29AAACI1234L1Z1",
      services: ["IT Consulting", "Software Development"],
      rating: 4.7,
    },
    {
      _id: "v4",
      name: "Tata Consultancy Services",
      contactPerson: "Pooja Mehta",
      phone: "+91-9090909090",
      email: "pooja.mehta@tcs.com",
      address: "Mumbai, Maharashtra",
      gstNumber: "27AAACR5055K1Z7",
      services: ["Enterprise Solutions", "Tech Support"],
      rating: 4.5,
    },
    {
      _id: "v5",
      name: "Dell Technologies",
      contactPerson: "Amitabh Verma",
      phone: "+91-8811223344",
      email: "amitabh@dell.com",
      address: "Noida, Uttar Pradesh",
      gstNumber: "09AACCD1234M1Z2",
      services: ["Hardware Sales", "Maintenance Services"],
      rating: 4.4,
    },
    {
      _id: "v6",
      name: "Wipro Ltd",
      contactPerson: "Sneha Reddy",
      phone: "+91-9876547890",
      email: "sneha.reddy@wipro.com",
      address: "Bangalore, Karnataka",
      gstNumber: "29AAACW1234F1Z6",
      services: ["Infrastructure Management", "BPO Services"],
      rating: 4.3,
    },
    {
      _id: "v7",
      name: "Amazon Web Services India",
      contactPerson: "Karan Malhotra",
      phone: "+91-9998887776",
      email: "karan@aws.amazon.com",
      address: "Mumbai, Maharashtra",
      gstNumber: "27AABCA1234H1Z5",
      services: ["Cloud Hosting", "Data Storage"],
      rating: 4.9,
    },
    {
      _id: "v8",
      name: "Cisco Systems India",
      contactPerson: "Vikram Singh",
      phone: "+91-9876123450",
      email: "vikram.singh@cisco.com",
      address: "Bengaluru, Karnataka",
      gstNumber: "29AABCC1234P1Z3",
      services: ["Networking Equipment", "Cybersecurity Solutions"],
      rating: 4.7,
    },
    {
      _id: "v9",
      name: "Lenovo India Pvt Ltd",
      contactPerson: "Priya Iyer",
      phone: "+91-8765432109",
      email: "priya.iyer@lenovo.com",
      address: "Chennai, Tamil Nadu",
      gstNumber: "33AABCL1234Q1Z4",
      services: ["Laptops & Desktops", "Data Center Solutions"],
      rating: 4.5,
    }
  ];

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

  const vendorColumns = [
    { field: "id", headerName: "Sr No",width:100 },
    { field: "name", headerName: "Vendor Name" },
    { field: "contactPerson", headerName: "Contact Person" },
    { field: "phone", headerName: "Phone" },
    { field: "email", headerName: "Email" },
    { field: "address", headerName: "Address" },
    { field: "gstNumber", headerName: "GST Number" },
    { field: "services", headerName: "Services" },
    { field: "rating", headerName: "Rating" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            // onClick={() => handleVendorView(params.data)}
          >
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
      <AgTable
        key={vendorsList.length}
        search={true}
        searchColumn={"name"}
        tableTitle={"Vendor Database"}
        buttonTitle={"Add Vendor"}
        data={vendorsList.map((vendor, index) => ({
          id: index + 1,
          name: vendor.name,
          contactPerson: vendor.contactPerson,
          phone: vendor.phone,
          email: vendor.email,
          address: vendor.address,
          gstNumber: vendor.gstNumber,
          services: vendor.services.join(", "),
          rating: vendor.rating,
        }))}
        columns={vendorColumns}
        handleClick={handleAddAsset}
      />

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
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Vendor Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Vendor Name:</strong> {selectedAsset.name}
              </div>
              <div>
                <strong>Contact Person:</strong> {selectedAsset.contactPerson}
              </div>
              <div>
                <strong>Phone:</strong> {selectedAsset.phone}
              </div>
              <div>
                <strong>Email:</strong> {selectedAsset.email}
              </div>
              <div>
                <strong>GST Number:</strong> {selectedAsset.gstNumber}
              </div>
              <div className="col-span-2">
                <strong>Address:</strong> {selectedAsset.address}
              </div>
              <div className="col-span-2">
                <strong>Services:</strong> {selectedAsset.services?.join(", ")}
              </div>
              <div>
                <strong>Rating:</strong> {selectedAsset.rating}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <PrimaryButton
                title="Close"
                handleSubmit={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default ItVendorReports;
