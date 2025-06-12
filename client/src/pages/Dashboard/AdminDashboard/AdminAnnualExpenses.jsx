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
import PageFrame from "./../../../components/Pages/PageFrame";

const AdminAnnualExpenses = () => {
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

  const annualExpenseColumns = [
    { field: "id", headerName: "Sr No" },
    { field: "category", headerName: "Category" },
    { field: "expenseName", headerName: "Expense Name", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "amount", headerName: "Amount (INR)" },
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

  const annualExpenses = [
    {
      category: "Stationery",
      expenseName: "Diaries",
      date: "08/04/2024",
      amount: 5000,
    },
    {
      category: "Furniture",
      expenseName: "Desks",
      date: "08/04/2024",
      amount: 10000,
    },
    {
      category: "Food & Beverages",
      expenseName: "Bottles",
      date: "08/04/2024",
      amount: 10000,
    },
    {
      category: "Bills",
      expenseName: "Electricity Bill",
      date: "08/04/2024",
      amount: 10100,
    },
    {
      category: "Miscellaneous",
      expenseName: "Event Decoration",
      date: "08/04/2024",
      amount: 10000,
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
          buttonTitle={"Add Expense"}
          data={[]}
          columns={annualExpenseColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Expense">
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
                      <MenuItem value="OfficeSupplies">
                        Office Supplies
                      </MenuItem>
                      <MenuItem value="FacilityManagement">
                        Facility Management
                      </MenuItem>
                      <MenuItem value="TravelArrangements">
                        Travel Arrangements
                      </MenuItem>
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
      </MuiModal>
    </div>
  );
};

export default AdminAnnualExpenses;
