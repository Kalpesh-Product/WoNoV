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
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../components/DetalisFormatted";
import PageFrame from "../../../components/Pages/PageFrame";

const MaintenanceAnnualExpenses = () => {
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

  // const { data: assetsCategories = [], isPending: assetPending } = useQuery({
  //   queryKey: ["assetsCategories"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("/api/assets/get-category");
  //       return response.data;
  //     } catch (error) {
  //       throw new Error(error.response.data.message);
  //     }
  //   },
  // });
  // const { data: vendorDetials = [], isPending: isVendorDetails } = useQuery({
  //   queryKey: ["vendorDetials"],
  //   queryFn: async () => {
  //     try {
  //       const response = await axios.get("/api/vendors/get-vendors");
  //       return response.data;
  //     } catch (error) {
  //       throw new Error(error.response.data.message);
  //     }
  //   },
  // });

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
    { field: "category", headerName: "Category" },
    { field: "expenseName", headerName: "Expense Name", flex: 1 },
    { field: "amount", headerName: "Amount (INR)" },
    { field: "date", headerName: "Date" },
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

  const annualExpenses = [
    {
      srNo: 1,
      category: "AC",
      expenseName: "Baga AC",
      date: "08/04/2024",
      amount: "5,000",
    },
    {
      srNo: 2,
      category: "Furniture",
      expenseName: "5th Floor Chairs",
      date: "08/04/2024",
      amount: "10,000",
    },
    {
      srNo: 3,
      category: "Carpets",
      expenseName: "7th Floor Carpet",
      date: "08/04/2024",
      amount: "10,000",
    },
    {
      srNo: 4,
      category: "Plumbing",
      expenseName: "Cafe Washroom Tap",
      date: "08/04/2024",
      amount: "10,100",
    },
    {
      srNo: 5,
      category: "Miscellaneous",
      expenseName: "Elevator Repair",
      date: "08/04/2024",
      amount: "10,000",
    },
    {
      srNo: 6,
      category: "Cleaning",
      expenseName: "Monthly Cleaning Service",
      date: "09/05/2024",
      amount: "3,000",
    },
    {
      srNo: 7,
      category: "Maintenance Materials",
      expenseName: "Painting Services",
      date: "10/05/2024",
      amount: "2,000",
    },
    {
      srNo: 8,
      category: "Maintenance Materials",
      expenseName: "Floor Tiles Replacement",
      date: "15/05/2024",
      amount: "1,500",
    },
    {
      srNo: 9,
      category: "Repairs",
      expenseName: "Water Pipe Repair",
      date: "20/05/2024",
      amount: "2,500",
    },
    {
      srNo: 10,
      category: "Repairs",
      expenseName: "Air Conditioning Overhaul",
      date: "22/05/2024",
      amount: "6,000",
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
          key={annualExpenses.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"Annual Expenses"}
          // buttonTitle={"Add Expense"}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "view" ? "View Details" : "Add Expense"}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-1 gap-4">
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      size="small"
                      helperText={!!errors.assetType?.message}
                      select>
                      <MenuItem value="" disabled>
                        Select an Asset Type
                      </MenuItem>
                      <MenuItem value="Furniture">Furniture</MenuItem>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="expenseName"
                  control={control}
                  rules={{ required: "Expense Name is required" }}
                  render={({ field }) => (
                    <TextField
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      fullWidth
                      {...field}
                      label="Expense Name"
                      size="small"
                    />
                  )}
                />
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Amount is required" }}
                  render={({ field }) => (
                    <TextField
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      fullWidth
                      {...field}
                      label="Amount"
                      size="small"
                    />
                  )}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="expenseDate"
                    control={control}
                    defaultValue={null}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Date"
                        format="DD-MM-YYYY"
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
              </div>
              {/* Main end div*/}
              {/* Conditionally render submit/edit button */}
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton
                  handleSubmit={() => {
                    toast.success("Expense type added succesfully");
                    setIsModalOpen(false);
                  }}
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
              title="Category"
              detail={selectedAsset.category}
            />
            <DetalisFormatted
              title="Expense Name"
              detail={selectedAsset.expenseName}
            />
            <DetalisFormatted
              title="Amount"
              detail={`INR ${selectedAsset.amount}`}
            />
            <DetalisFormatted title="Date" detail={selectedAsset.date} />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default MaintenanceAnnualExpenses;
