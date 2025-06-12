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
import PageFrame from "../../../../components/Pages/PageFrame";

const AdminVendorDatabase = () => {
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

  const vendorColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
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
        <div className="p-2 mb-2  flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => {
              const fullVendor = vendorsList.find(
                (v) =>
                  v.name === params.data.name && v.email === params.data.email
              );
              handleDetailsClick(fullVendor);
            }}>
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

  const vendorsList = [
    {
      _id: "v1",
      name: "Urban Office Solutions",
      contactPerson: "Manish Agarwal",
      phone: "+91-9876543210",
      email: "manish@urbanoffice.in",
      address: "Delhi, India",
      gstNumber: "07ABCDE1234F2Z5",
      services: ["Office Furniture", "Space Planning"],
      rating: 4.6,
    },
    {
      _id: "v2",
      name: "Clean & Green Services",
      contactPerson: "Shalini Gupta",
      phone: "+91-9123456789",
      email: "shalini@cleanandgreen.com",
      address: "Mumbai, Maharashtra",
      gstNumber: "27ABCDE5678G3Z2",
      services: ["Housekeeping", "Sanitation Supplies"],
      rating: 4.4,
    },
    {
      _id: "v3",
      name: "Pantry Plus",
      contactPerson: "Arun Joshi",
      phone: "+91-9988776655",
      email: "arun@pantryplus.in",
      address: "Pune, Maharashtra",
      gstNumber: "27AAACI1234L1Z1",
      services: ["Pantry Supplies", "Coffee Machines"],
      rating: 4.5,
    },
    {
      _id: "v4",
      name: "Furniture Mart India",
      contactPerson: "Neha Deshpande",
      phone: "+91-9090909090",
      email: "neha@furnituremart.in",
      address: "Bangalore, Karnataka",
      gstNumber: "29AAACR5055K1Z7",
      services: ["Chairs", "Workstations", "Tables"],
      rating: 4.7,
    },
    {
      _id: "v5",
      name: "PrintWorks",
      contactPerson: "Sandeep Chauhan",
      phone: "+91-8811223344",
      email: "sandeep@printworks.in",
      address: "Noida, Uttar Pradesh",
      gstNumber: "09AACCD1234M1Z2",
      services: ["Printing", "Office Stationery"],
      rating: 4.3,
    },
    {
      _id: "v6",
      name: "SafeGuard Systems",
      contactPerson: "Divya Rathi",
      phone: "+91-9876547890",
      email: "divya@safeguard.co.in",
      address: "Hyderabad, Telangana",
      gstNumber: "36AAACW1234F1Z6",
      services: ["Security Equipment", "CCTV Installation"],
      rating: 4.6,
    },
    {
      _id: "v7",
      name: "Refresh Café Services",
      contactPerson: "Karan Patel",
      phone: "+91-9998887776",
      email: "karan@refreshcafe.in",
      address: "Ahmedabad, Gujarat",
      gstNumber: "24AABCA1234H1Z5",
      services: ["Cafeteria Management", "Snack Supply"],
      rating: 4.5,
    },
    {
      _id: "v8",
      name: "Bright Logistics",
      contactPerson: "Ritika Mehra",
      phone: "+91-9876123450",
      email: "ritika@brightlogistics.in",
      address: "Gurgaon, Haryana",
      gstNumber: "06AABCC1234P1Z3",
      services: ["Courier", "Document Delivery"],
      rating: 4.4,
    },
    {
      _id: "v9",
      name: "GreenScape Solutions",
      contactPerson: "Vivek Menon",
      phone: "+91-8765432109",
      email: "vivek@greenscape.in",
      address: "Chennai, Tamil Nadu",
      gstNumber: "33AABCL1234Q1Z4",
      services: ["Office Plants", "Landscaping"],
      rating: 4.6,
    },
  ];

  // const vendorsList = []

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
          key={vendorsList.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"Vendor Database"}
          buttonTitle={"Add Vendor"}
          data={[]}
          columns={vendorColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add Vendor" : "Vendor Details"}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Vendor Name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vendor Name"
                      size="small"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="contactPerson"
                  control={control}
                  rules={{ required: "Contact Person is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Person"
                      size="small"
                      error={!!errors.contactPerson}
                      helperText={errors.contactPerson?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone"
                      size="small"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      size="small"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="gstNumber"
                  control={control}
                  rules={{ required: "GST Number is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="GST Number"
                      size="small"
                      error={!!errors.gstNumber}
                      helperText={errors.gstNumber?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="rating"
                  control={control}
                  rules={{ required: "Rating is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rating"
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                      error={!!errors.rating}
                      helperText={errors.rating?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="services"
                  control={control}
                  rules={{ required: "Services are required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Services (comma-separated)"
                      size="small"
                      error={!!errors.services}
                      helperText={errors.services?.message}
                      fullWidth
                      className="col-span-2"
                    />
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: "Address is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      size="small"
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      fullWidth
                      className="col-span-2"
                    />
                  )}
                />
              </div>
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
                title="Vendor Name"
                detail={selectedAsset.name}
              />
              <DetalisFormatted
                title="Contact Person"
                detail={selectedAsset.contactPerson}
              />
              <DetalisFormatted title="Phone" detail={selectedAsset.phone} />
              <DetalisFormatted title="Email" detail={selectedAsset.email} />
              <DetalisFormatted
                title="GST Number"
                detail={selectedAsset.gstNumber}
              />
              <div className="col-span-2">
                <DetalisFormatted
                  title="Address"
                  detail={selectedAsset.address}
                  gap="w-[20%]"
                />
              </div>
              <div className="col-span-2">
                <DetalisFormatted
                  title="Services"
                  detail={selectedAsset.services?.join(", ")}
                  gap="w-[20%]"
                />
              </div>
              <DetalisFormatted title="Rating" detail={selectedAsset.rating} />
            </div>
          </div>
        )}
      </MuiModal>
    </>
  );
};

export default AdminVendorDatabase;
