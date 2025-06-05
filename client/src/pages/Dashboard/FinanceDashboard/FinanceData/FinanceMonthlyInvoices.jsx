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
import { Button, Chip, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../../hooks/useAuth";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";

const FinanceMonthlyInvoices = () => {
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

  const invoiceColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "month", headerName: "Month" },
    { field: "invoiceNumber", headerName: "Invoice Number" },
    { field: "vendor", headerName: "Vendor" },
    { field: "service", headerName: "Service" },
    { field: "invoiceDate", headerName: "Invoice Date" },
    { field: "dueDate", headerName: "Due Date" },
    { field: "amount", headerName: "Amount (INR)" },
    { field: "status", headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value;

        const statusColorMap = {
          Unpaid: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Paid: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={status}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
        <div className="flex gap-2 items-center">
          <div
             
            className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
          >
            <span className="text-subtitle cursor-pointer"
            onClick={() => handleViewModal(params.data)}>
              <MdOutlineRemoveRedEye />
            </span>
          </div>
        </div>
      </>
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

  // const monthlyInvoices = [
  //   {
  //     srNo: 1,
  //     month: "April-24",
  //     invoiceNumber: "INV-2024-001",
  //     vendor: "FinAudit Consultants",
  //     service: "Quarterly Audit",
  //     invoiceDate: "2024-04-05",
  //     dueDate: "2024-04-20",
  //     amount: 45000,
  //     status: "Paid",
  //   },
  //   {
  //     srNo: 2,
  //     month: "May-24",
  //     invoiceNumber: "INV-2024-002",
  //     vendor: "ClearTax",
  //     service: "GST Filing",
  //     invoiceDate: "2024-05-03",
  //     dueDate: "2024-05-18",
  //     amount: 18000,
  //     status: "Unpaid",
  //   },
  //   {
  //     srNo: 3,
  //     month: "June-24",
  //     invoiceNumber: "INV-2024-003",
  //     vendor: "Tally Solutions",
  //     service: "Accounting Software License",
  //     invoiceDate: "2024-06-01",
  //     dueDate: "2024-06-15",
  //     amount: 12000,
  //     status: "Paid",
  //   },
  //   {
  //     srNo: 4,
  //     month: "July-24",
  //     invoiceNumber: "INV-2024-004",
  //     vendor: "QuickBooks India",
  //     service: "Bookkeeping Services",
  //     invoiceDate: "2024-07-10",
  //     dueDate: "2024-07-25",
  //     amount: 30000,
  //     status: "Unpaid",
  //   },
  //   {
  //     srNo: 5,
  //     month: "August-24",
  //     invoiceNumber: "INV-2024-005",
  //     vendor: "FinAudit Consultants",
  //     service: "Compliance Review",
  //     invoiceDate: "2024-08-07",
  //     dueDate: "2024-08-22",
  //     amount: 25000,
  //     status: "Paid",
  //   },
  // ];

  
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
        key={0}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Monthly Invoices"}
        // buttonTitle={"Add Asset"}
        data={ [
          // ...monthlyInvoices.map((invoice, index) => ({
          //   srNo: index + 1,
          //   month:  `${dayjs(`${invoice.month} 1`, "MMMM D").format("MMM")
          //   }-24`,
          //   invoiceNumber: invoice.invoiceNumber || "-",
          //   vendor: invoice.vendor || "-",
          //   service: invoice.service || "-",
          //   invoiceDate: invoice.invoiceDate
          //     ? dayjs(invoice.invoiceDate).format("DD-MM-YYYY")
          //     : "-",
          //   dueDate: invoice.dueDate
          //     ? dayjs(invoice.dueDate).format("DD-MM-YYYY")
          //     : "-",
          //   amount: Number(invoice.amount)?.toLocaleString("en-IN") || "0",
          //   status: invoice.status || "-",
          // })),
        ]}
        columns={invoiceColumns}
        handleClick={handleAddAsset}
      />

{viewDetails && (
  <MuiModal
    open={viewModalOpen}
    onClose={() => setViewModalOpen(false)}
    title="Invoice Detail"
  >
    <div className="space-y-3">
      <DetalisFormatted title="Month" detail={viewDetails.month} />
      <DetalisFormatted title="Invoice Number" detail={viewDetails.invoiceNumber} />
      <DetalisFormatted title="Vendor" detail={viewDetails.vendor} />
      <DetalisFormatted title="Service" detail={viewDetails.service} />
      <DetalisFormatted title="Invoice Date" detail={viewDetails.invoiceDate} />
      <DetalisFormatted title="Due Date" detail={viewDetails.dueDate} />
      <DetalisFormatted
        title="Amount"
        detail={`INR ${Number(String(viewDetails.amount).replace(/,/g, "")).toLocaleString("en-IN")}`}
      />
      <DetalisFormatted title="Status" detail={viewDetails.status} />
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

export default FinanceMonthlyInvoices;
