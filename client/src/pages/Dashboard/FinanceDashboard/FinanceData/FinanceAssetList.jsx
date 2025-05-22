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
import DetalisFormatted from "../../../../components/DetalisFormatted";

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
    { field: "assetName", headerName: "Asset Name" },
    { field: "category", headerName: "Category" },
    { field: "tangibleIntangibleAsset", headerName: "Classification" },
{ field: "brandName", headerName: "Brand" },
{ field: "totalPrice", headerName: "Price (INR)" },
{ field: "quantity", headerName: "Quantity" },
{ field: "purchaseDate", headerName: "Purchase Date" }, 
{ field: "warrantyInMonths", headerName: "Warranty (Months)" },

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

  // const assetsList = [
  //   {
  //     id: 2,
  //     department: { name: "Finance" },
  //     name: "Tally ERP 9 License",
  //     classification: "Intangible",
  //     brand: "Tally Solutions",
  //     price: 18000,
  //     quantity: 2,
  //     purchaseDate: "2023-06-15",
  //     warranty: 12,
  //     vendor: { name: "Tally Solutions Pvt. Ltd." },
  //   },
  //   {
  //     id: 3,
  //     department: { name: "Finance" },
  //     name: "QuickBooks License",
  //     classification: "Intangible",
  //     brand: "Intuit",
  //     price: 24000,
  //     quantity: 1,
  //     purchaseDate: "2023-05-20",
  //     warranty: 12,
  //     vendor: { name: "QuickBooks India" },
  //   },
  //   {
  //     id: 5,
  //     department: { name: "Finance" },
  //     name: "NAS Storage Server",
  //     classification: "Tangible",
  //     brand: "Synology",
  //     price: 65000,
  //     quantity: 1,
  //     purchaseDate: "2023-07-05",
  //     warranty: 36,
  //     vendor: { name: "TechServe Solutions" },
  //   },
  //   {
  //     id: 8,
  //     department: { name: "Finance" },
  //     name: "MS Excel Pro Plus License",
  //     classification: "Intangible",
  //     brand: "Microsoft",
  //     price: 12000,
  //     quantity: 5,
  //     purchaseDate: "2023-10-25",
  //     warranty: 12,
  //     vendor: { name: "Microsoft India" },
  //   },
  // ];
  
const assetsList = [
  {
    "assetName": "Laser Invoice Printer",
    "assetType": "Physical",
    "tangibleIntangibleAsset": "Tangible",
    "vendorName": "HP",
    "category": "Hardware",
    "subCategory": "Printing",
    "purchaseDate": "2024-03-15",
    "quantity": 3,
    "pricePerUnit": 15000,
    "totalPrice": 45000,
    "warrantyInMonths": 24,
    "assetImage": "url_to_invoice_printer_image",
    "brandName": "HP",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Finance Wing - Ground Floor",
    "assignedUnit": "Accounts Payable",
    "assignedTo": "EMP101",
    "assignedDate": "2024-03-18"
  },
  {
    "assetName": "Financial Analysis Software",
    "assetType": "Digital",
    "tangibleIntangibleAsset": "Intangible",
    "vendorName": "Zoho",
    "category": "Software",
    "subCategory": "Analysis",
    "purchaseDate": "2024-06-01",
    "quantity": 10,
    "pricePerUnit": 5000,
    "totalPrice": 50000,
    "warrantyInMonths": 36,
    "assetImage": "url_to_software_screenshot",
    "brandName": "Zoho Analytics",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Finance Department - 2nd Floor",
    "assignedUnit": "Financial Planning",
    "assignedTo": "EMP108",
    "assignedDate": "2024-06-02"
  },
  {
    "assetName": "Budgeting LED Monitor",
    "assetType": "Physical",
    "tangibleIntangibleAsset": "Tangible",
    "vendorName": "Dell",
    "category": "Hardware",
    "subCategory": "Display",
    "purchaseDate": "2023-11-20",
    "quantity": 5,
    "pricePerUnit": 12000,
    "totalPrice": 60000,
    "warrantyInMonths": 36,
    "assetImage": "url_to_monitor_image",
    "brandName": "Dell",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Accounts Block",
    "assignedUnit": "Budget Control",
    "assignedTo": "EMP110",
    "assignedDate": "2023-11-25"
  },
  {
    "assetName": "Accounting ERP License",
    "assetType": "Digital",
    "tangibleIntangibleAsset": "Intangible",
    "vendorName": "SAP",
    "category": "Software",
    "subCategory": "Accounting",
    "purchaseDate": "2023-09-01",
    "quantity": 8,
    "pricePerUnit": 25000,
    "totalPrice": 200000,
    "warrantyInMonths": 48,
    "assetImage": "url_to_erp_dashboard",
    "brandName": "SAP Business One",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Main Building",
    "assignedUnit": "Accounts Receivable",
    "assignedTo": "EMP113",
    "assignedDate": "2023-09-03"
  },
  {
    "assetName": "Laptop for Budget Forecasting",
    "assetType": "Physical",
    "tangibleIntangibleAsset": "Tangible",
    "vendorName": "Lenovo",
    "category": "Hardware",
    "subCategory": "Laptop",
    "purchaseDate": "2024-02-01",
    "quantity": 2,
    "pricePerUnit": 65000,
    "totalPrice": 130000,
    "warrantyInMonths": 24,
    "assetImage": "url_to_laptop_image",
    "brandName": "Lenovo ThinkPad",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Finance HQ",
    "assignedUnit": "Budget Planning",
    "assignedTo": "EMP120",
    "assignedDate": "2024-02-03"
  },
  {
    "assetName": "High-Speed Document Scanner",
    "assetType": "Physical",
    "tangibleIntangibleAsset": "Tangible",
    "vendorName": "Canon",
    "category": "Hardware",
    "subCategory": "Scanner",
    "purchaseDate": "2023-08-10",
    "quantity": 2,
    "pricePerUnit": 18000,
    "totalPrice": 36000,
    "warrantyInMonths": 36,
    "assetImage": "url_to_scanner_image",
    "brandName": "Canon DR-C240",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Document Room",
    "assignedUnit": "Audit Support",
    "assignedTo": "EMP125",
    "assignedDate": "2023-08-15"
  },
  {
    "assetName": "Excel Macro Automation Tool",
    "assetType": "Digital",
    "tangibleIntangibleAsset": "Intangible",
    "vendorName": "MacroSoft",
    "category": "Software",
    "subCategory": "Productivity",
    "purchaseDate": "2024-05-01",
    "quantity": 20,
    "pricePerUnit": 1200,
    "totalPrice": 24000,
    "warrantyInMonths": 12,
    "assetImage": "url_to_macro_tool_image",
    "brandName": "MacroSoft Tools",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Finance Floor",
    "assignedUnit": "Data Entry & Reconciliation",
    "assignedTo": "EMP130",
    "assignedDate": "2024-05-01"
  },
  {
    "assetName": "Data Backup External HDDs",
    "assetType": "Physical",
    "tangibleIntangibleAsset": "Tangible",
    "vendorName": "Seagate",
    "category": "Hardware",
    "subCategory": "Storage",
    "purchaseDate": "2024-01-12",
    "quantity": 4,
    "pricePerUnit": 5500,
    "totalPrice": 22000,
    "warrantyInMonths": 24,
    "assetImage": "url_to_hdd_image",
    "brandName": "Seagate Expansion",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Vault Room",
    "assignedUnit": "Records & Compliance",
    "assignedTo": "EMP134",
    "assignedDate": "2024-01-15"
  },
  {
    "assetName": "Cloud Bookkeeping Subscription",
    "assetType": "Digital",
    "tangibleIntangibleAsset": "Intangible",
    "vendorName": "QuickBooks",
    "category": "Software",
    "subCategory": "Bookkeeping",
    "purchaseDate": "2024-04-10",
    "quantity": 1,
    "pricePerUnit": 35000,
    "totalPrice": 35000,
    "warrantyInMonths": 12,
    "assetImage": "url_to_quickbooks_image",
    "brandName": "QuickBooks Online",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Online",
    "assignedUnit": "Expense Tracking",
    "assignedTo": "EMP138",
    "assignedDate": "2024-04-12"
  },
  {
    "assetName": "Online Tax Filing Suite",
    "assetType": "Digital",
    "tangibleIntangibleAsset": "Intangible",
    "vendorName": "ClearTax",
    "category": "Software",
    "subCategory": "Tax Filing",
    "purchaseDate": "2024-07-01",
    "quantity": 5,
    "pricePerUnit": 4000,
    "totalPrice": 20000,
    "warrantyInMonths": 12,
    "assetImage": "url_to_cleartax_image",
    "brandName": "ClearTax Pro",
    "department": "Finance",
    "status": "Active",
    "assignedLocation": "Virtual Workspace",
    "assignedUnit": "Taxation",
    "assignedTo": "EMP140",
    "assignedDate": "2024-07-02"
  }

]

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
            // // department: asset.department.name,
            // category: asset.name,
            // classification : asset.classification,
            // brand: asset.brand,
            totalPrice: Number(asset.totalPrice.toLocaleString("en-IN").replace(/,/g, "")).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            // quantity: asset.quantity,
            // purchaseDate: dayjs(asset.purchaseDate).format("DD-MM-YYYY"),
            // warranty: asset.warranty,
            // vendorName: asset.vendor.name,
            ...asset
          })),
        ]}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Asset Detail"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Category" detail={viewDetails.category} />
            <DetalisFormatted title="Brand" detail={viewDetails.brand} />
            <DetalisFormatted
              title="Price"
              detail={`INR ${Number(viewDetails.price?.toString().replace(/,/g, "")).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}`}
            />
            <DetalisFormatted title="Quantity" detail={viewDetails.quantity} />
            <DetalisFormatted title="Purchase Date" detail={viewDetails.purchaseDate} />
            <DetalisFormatted title="Warranty (Months)" detail={viewDetails.warranty} />
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
                        className={`w-full flex justify-center border-2 rounded-md p-2 relative ${errors.assetImage
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
