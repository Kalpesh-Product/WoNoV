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

const FinanceVendorDatabase = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
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

  const vendorColumns = [
    { field: "id", headerName: "Sr No" },
    { field: "vendorName", headerName: "Vendor Name" },
    { field: "companyName", headerName: "Company Name" },
    { field: "onboardingDate", headerName: "Onboarding Date" },
    { field: "emailId", headerName: "Email Id" },
    { field: "mobileNo", headerName: "Mobile No" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: (params) => (
        <>
          <div className="flex gap-2 items-center">
            <div className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all">
              <span
                className="text-subtitle cursor-pointer"
                onClick={() => handleViewModal(params.data)}
              >
                <MdOutlineRemoveRedEye />
              </span>
            </div>
          </div>
        </>
      ),
    },
  ];

  //   const vendorData = [
  //   {
  //     vendorName: "Apex Supplies",
  //     companyName: "Apex Pvt Ltd",
  //     onboardingDate: "15-04-2024",
  //     emailId: "contact@apex.com",
  //     mobileNo: "9876543210",
  //     address: "12 Green Street",
  //     country: "India",
  //     state: "Maharashtra",
  //     city: "Mumbai",
  //     pinCode: "400001",
  //     pan: "ABCDE1234F",
  //     gstin: "27ABCDE1234F1Z5",
  //     partyType: "Domestic",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "Global Traders",
  //     companyName: "Global Exports Ltd",
  //     onboardingDate: "20-05-2024",
  //     emailId: "sales@globalexports.com",
  //     mobileNo: "9812345678",
  //     address: "88 Maple Avenue",
  //     country: "India",
  //     state: "Delhi",
  //     city: "New Delhi",
  //     pinCode: "110001",
  //     pan: "FGHIJ5678K",
  //     gstin: "07FGHIJ5678K1Z2",
  //     partyType: "International",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "TechnoGears",
  //     companyName: "TechnoGears Inc.",
  //     onboardingDate: "10-06-2024",
  //     emailId: "info@technogears.com",
  //     mobileNo: "9823456789",
  //     address: "2nd Cross, Silicon Valley",
  //     country: "India",
  //     state: "Karnataka",
  //     city: "Bangalore",
  //     pinCode: "560001",
  //     pan: "KLMNO2345P",
  //     gstin: "29KLMNO2345P1Z6",
  //     partyType: "Domestic",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "Elite Textiles",
  //     companyName: "Elite Fashion Corp.",
  //     onboardingDate: "05-07-2024",
  //     emailId: "elite@fashioncorp.com",
  //     mobileNo: "9845671234",
  //     address: "Main Street, Textile Market",
  //     country: "India",
  //     state: "Tamil Nadu",
  //     city: "Chennai",
  //     pinCode: "600001",
  //     pan: "PQRST6789U",
  //     gstin: "33PQRST6789U1Z3",
  //     partyType: "Domestic",
  //     vendorStatus: "Inactive"
  //   },
  //   {
  //     vendorName: "Fusion Logistics",
  //     companyName: "Fusion Movers Ltd",
  //     onboardingDate: "18-08-2024",
  //     emailId: "logistics@fusion.com",
  //     mobileNo: "9911223344",
  //     address: "Sector 45, Industrial Area",
  //     country: "India",
  //     state: "Haryana",
  //     city: "Gurgaon",
  //     pinCode: "122001",
  //     pan: "LMNOP9876Q",
  //     gstin: "06LMNOP9876Q1Z7",
  //     partyType: "Domestic",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "Bright Chemicals",
  //     companyName: "Bright Labs",
  //     onboardingDate: "30-09-2024",
  //     emailId: "bright@chem.com",
  //     mobileNo: "9887766554",
  //     address: "Plot 12, Pharma Zone",
  //     country: "India",
  //     state: "Gujarat",
  //     city: "Ahmedabad",
  //     pinCode: "380001",
  //     pan: "QRSTU1234V",
  //     gstin: "24QRSTU1234V1Z1",
  //     partyType: "Domestic",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "NextWave Solutions",
  //     companyName: "NextWave Tech",
  //     onboardingDate: "11-11-2024",
  //     emailId: "support@nextwave.com",
  //     mobileNo: "9900112233",
  //     address: "Tech Park, Block 9",
  //     country: "India",
  //     state: "Telangana",
  //     city: "Hyderabad",
  //     pinCode: "500001",
  //     pan: "UVWXY3456Z",
  //     gstin: "36UVWXY3456Z1Z4",
  //     partyType: "International",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "Core Metalworks",
  //     companyName: "Core Industries",
  //     onboardingDate: "03-01-2025",
  //     emailId: "contact@coreindustries.com",
  //     mobileNo: "9877600001",
  //     address: "Industrial Layout, Phase II",
  //     country: "India",
  //     state: "Punjab",
  //     city: "Ludhiana",
  //     pinCode: "141001",
  //     pan: "ABCDL6789K",
  //     gstin: "03ABCDL6789K1Z0",
  //     partyType: "Domestic",
  //     vendorStatus: "Inactive"
  //   },
  //   {
  //     vendorName: "Ocean Foods",
  //     companyName: "Oceanic Agro",
  //     onboardingDate: "15-02-2025",
  //     emailId: "hello@oceanicagro.com",
  //     mobileNo: "9765432109",
  //     address: "Coastal Road",
  //     country: "India",
  //     state: "Kerala",
  //     city: "Kochi",
  //     pinCode: "682001",
  //     pan: "JKLMN3456L",
  //     gstin: "32JKLMN3456L1Z8",
  //     partyType: "Domestic",
  //     vendorStatus: "Active"
  //   },
  //   {
  //     vendorName: "Urban Prints",
  //     companyName: "Urban Publishing",
  //     onboardingDate: "20-03-2025",
  //     emailId: "info@urbanprints.com",
  //     mobileNo: "9856712345",
  //     address: "Print Hub, City Center",
  //     country: "India",
  //     state: "West Bengal",
  //     city: "Kolkata",
  //     pinCode: "700001",
  //     pan: "NOPQR7890M",
  //     gstin: "19NOPQR7890M1Z9",
  //     partyType: "International",
  //     vendorStatus: "Inactive"
  //   }
  // ];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

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
        key={0}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Vendor Database"}
        buttonTitle={"Add Vendor"}
        data={
          [
            // ...vendorData.map((item, index) => ({
            //   id: index + 1,
            //   ...item
            // })),
          ]
        }
        columns={vendorColumns}
        handleClick={handleAddAsset}
      />

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Vendor Detail"
        >
          <div className="space-y-3">
            <DetalisFormatted
              title="Vendor Name"
              detail={viewDetails.vendorName}
            />
            <DetalisFormatted
              title="Company Name"
              detail={viewDetails.companyName}
            />
            <DetalisFormatted
              title="Onboarding Date"
              detail={viewDetails.onboardingDate}
            />
            <DetalisFormatted title="Email" detail={viewDetails.emailId} />
            <DetalisFormatted title="Mobile No" detail={viewDetails.mobileNo} />
            <DetalisFormatted title="Address" detail={viewDetails.address} />
            <DetalisFormatted title="Country" detail={viewDetails.country} />
            <DetalisFormatted title="State" detail={viewDetails.state} />
            <DetalisFormatted title="City" detail={viewDetails.city} />
            <DetalisFormatted title="Pin Code" detail={viewDetails.pinCode} />
            <DetalisFormatted title="PAN" detail={viewDetails.pan} />
            <DetalisFormatted title="GSTIN" detail={viewDetails.gstin} />
            <DetalisFormatted
              title="Party Type"
              detail={viewDetails.partyType}
            />
            <DetalisFormatted
              title="Vendor Status"
              detail={viewDetails.vendorStatus}
            />
          </div>
        </MuiModal>
      )}

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
      </MuiModal>
    </>
  );
};

export default FinanceVendorDatabase;
