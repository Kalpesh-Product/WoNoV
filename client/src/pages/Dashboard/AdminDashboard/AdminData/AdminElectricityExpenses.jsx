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
import { Accordion, AccordionDetails, AccordionSummary, Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../../hooks/useAuth";
import humanDate from "../../../../utils/humanDateForamt";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { IoIosArrowDown } from "react-icons/io";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";

const AdminElectricityExpenses = () => {

  const electricityData = [
    {
      month: "April",
      units: [
        {
          location: "ST-701A",
          month: "Apr",
          expense: 24051,
          consumptionKWh: 2587.05,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        },
        {
          location: "ST-701B",
          month: "Apr",
          expense: 18800,
          consumptionKWh: 3486.07,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        },
        {
          location: "ST-601A",
          month: "Apr",
          expense: 24793,
          consumptionKWh: 3421.04,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        },
        {
          location: "ST-601B",
          month: "Apr",
          expense: 21980,
          consumptionKWh: 2768.56,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        },
        {
          location: "ST-501A",
          month: "Apr",
          expense: 21364,
          consumptionKWh: 2574.39,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        },
        {
          location: "ST-501B",
          month: "Apr",
          expense: 24687,
          consumptionKWh: 3232.29,
          billingDate: "2024-04-05T00:00:00",
          paidDate: "2024-04-10T00:00:00",
          paid: true
        }
      ]
    }
  ];
  
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(
      electricityData[0].month
    );
  
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
    { field: "location", headerName: "Location" },
  { field: "totalExpense", headerName: "Total Expense (INR)" },
  { field: "consumptionKWh", headerName: "Consumption (kWh)" },
  { field: "billingDate", headerName: "Billing Date" },
  { field: "paidDate", headerName: "Paid Date" },
  { field: "paid", headerName: "Paid" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <span
                   className="text-subtitle cursor-pointer"
                   onClick={() => handleDetailsClick(params.data)}
                 >
                   <MdOutlineRemoveRedEye />
                 </span>
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

 
  const transoformedElectricityData = electricityData.map((data)=>{
    let totalExpense 
    if(selectedMonth === data.month){
       totalExpense = data.units.reduce((acc,curr)=>acc+curr.expense,0)
    }

    return {...data,totalExpense}
   

   
  })
  

      return (
        <>
        {transoformedElectricityData.length > 0 && transoformedElectricityData.map((electricity,index)=>(
            <WidgetSection layout={1}  title={"Electricity Consumption & Expenses"} border> 
       <div className="mt-8">
          <Accordion key={index} className="py-4">
                  <AccordionSummary
                    expandIcon={<IoIosArrowDown />}
                    aria-controls={`panel-${index}-content`}
                    id={`panel-${index}-header`}>
                    <div className="flex justify-between items-center w-full px-4">
                      <span className="text-subtitle font-pmedium  ">
                       Apr-24
                      </span>
                      <span className="text-subtitle font-pmedium">
                        INR {inrFormat(electricity.totalExpense)}
                      </span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                   
                    <AgTable
            key={electricity.units.length}
            search={true}
            searchColumn={"Asset Number"}
           
            buttonTitle={"Add Expense"}
            data={[
              ...electricity.units.map((item, index) => ({
                id: index + 1,
                location: item.location,
                month: item.month,
                totalExpense: `${item.expense.toLocaleString("en-IN")}`,
                consumptionKWh: item.consumptionKWh,
                billingDate: humanDate(item.billingDate),
                paidDate: humanDate(item.paidDate),
                paid: item.paid ? "Yes" : "No",
              })),
            ]}        
            columns={assetColumns}
            handleClick={handleAddAsset}
          />
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-4">
                        <span className="text-primary font-pregular">
                          Total Expense for {electricity.month}:{" "}
                        </span>
                        <span className="text-black font-pmedium">
                          INR {electricity.totalExpense.toLocaleString()}
                        </span>{" "}
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
       </div>
    </WidgetSection>
))}
    
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
            {modalMode === "view" && selectedAsset && (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <DetalisFormatted title="Location" detail={selectedAsset.location} />
          <DetalisFormatted title="Month" detail={selectedAsset.month} />
          <DetalisFormatted title="Total Expense" detail={`INR ${selectedAsset.totalExpense.toLocaleString("en-IN")}`} />
          <DetalisFormatted title="Consumption (kWh)" detail={selectedAsset.consumptionKWh.toLocaleString()} />
          <DetalisFormatted
            title="Billing Date"
            detail={dayjs(selectedAsset.billingDate).format("DD-MM-YYYY")}
          />
          <DetalisFormatted
            title="Paid Date"
            detail={
              selectedAsset.paidDate
                ? dayjs(selectedAsset.paidDate).format("DD-MM-YYYY")
                : "Not Paid"
            }
          />
          <DetalisFormatted title="Paid Status" detail={selectedAsset.paid ? "Paid" : "Unpaid"} />
        </div>
      </div>
    )}
    
          </MuiModal>
        </>
      );
    
  
 
};

export default AdminElectricityExpenses;
