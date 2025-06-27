import { useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../../components/Pages/PageFrame";
import humanDate from "../../../utils/humanDateForamt";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import usePageDepartment from "../../../hooks/usePageDepartment";
import { queryClient } from "../../../main";
import { inrFormat } from "../../../utils/currencyFormat";

const maintainanceCategories = [
  { id: 1, name: "Electrical" },
  { id: 2, name: "Civil" },
  { id: 3, name: "Plumbing" },
  { id: 4, name: "HVAC" },
  { id: 5, name: "Interiors design & Installations" },
  { id: 6, name: "Utilities" },
];

const adminCategories = [
  { id: 1, name: "HK Inventory" },
  { id: 2, name: "Stationary" },
  { id: 3, name: "First Aid" },
];

const Inventory = () => {
  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      itemName: "",
      department: "",
      openingInventoryUnits: "",
      openingPerUnitPrice: "",
      openingInventoryValue: "",
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
      closingInventoryUnits: "",
      category: "",
    },
  });

  const { data: inventoryData, isPending: isInventoryLoading } = useQuery({
    queryKey: ["maintainance-inventory"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/inventory/get-inventories?department=${department._id}`
        );
        return response.data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: addAsset, isPending: isAddingAsset } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/inventory/add-inventory-item",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Inventory added successfully!");
      queryClient.invalidateQueries(["maintainance-inventory"]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add inventory. Please try again.");
      console.error(error);
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
    const formData = new FormData();

    formData.append("itemName", data.itemName);
    formData.append("department", department._id);
    formData.append("openingInventoryUnits", data.openingInventoryUnits);
    formData.append("openingPerUnitPrice", data.openingPerUnitPrice);
    formData.append("openingInventoryValue", data.openingInventoryValue);
    formData.append("newPurchaseUnits", data.newPurchaseUnits);
    formData.append("newPurchasePerUnitPrice", data.newPurchasePerUnitPrice);
    formData.append(
      "newPurchaseInventoryValue",
      data.newPurchaseInventoryValue
    );
    formData.append("closingInventoryUnits", data.closingInventoryUnits);
    formData.append("category", data.category);

    addAsset(formData);
  };

  const inventoryColumns = [
    {
      field: "id",
      headerName: "Sr No",
      width: 100,
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    { field: "itemName", headerName: "Item Name" },
    {
      field: "openingInventoryUnits",
      headerName: "Opening Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "openingInventoryValue",
      headerName: "Opening Value (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "newPurchaseUnits",
      headerName: "New Purchase Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "newPurchaseInventoryValue",
      headerName: "New Purchase Value",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "closingInventoryUnits",
      headerName: "Closing Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "date",
      headerName: "Date",
      valueGetter: (params) => humanDate(params.data?.date),
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div
          onClick={() => {
            handleDetailsClick(params.data);
          }}
          className="hover:bg-gray-200 cursor-pointer p-2 px-0 rounded-full transition-all w-1/4 flex justify-center"
        >
          <span className="text-subtitle">
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          key={isInventoryLoading ? 0 : inventoryData?.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"List Of Inventory"}
          hideTitle={true}
          buttonTitle={"Add Inventory"}
          data={inventoryData || []}
          tableHeight={450}
          dateColumn={"date"}
          columns={inventoryColumns}
          handleSubmit={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "view" ? "View Details" : "Add Inventory"}
      >
        {modalMode === "add" && (
          <div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <Controller
                name="itemName"
                control={control}
                rules={{ required: "Item name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Item Name"
                    fullWidth
                    size="small"
                    error={!!errors.itemName}
                    helperText={errors.itemName?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryUnits"
                control={control}
                rules={{ required: "Opening units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.openingInventoryUnits}
                    helperText={errors.openingInventoryUnits?.message}
                  />
                )}
              />

              <Controller
                name="openingPerUnitPrice"
                control={control}
                rules={{ required: "Per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.openingPerUnitPrice}
                    helperText={errors.openingPerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryValue"
                control={control}
                rules={{ required: "Opening value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Value"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.openingInventoryValue}
                    helperText={errors.openingInventoryValue?.message}
                  />
                )}
              />

              <Controller
                name="newPurchaseUnits"
                control={control}
                rules={{ required: "New purchase units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.newPurchaseUnits}
                    helperText={errors.newPurchaseUnits?.message}
                  />
                )}
              />

              <Controller
                name="newPurchasePerUnitPrice"
                control={control}
                rules={{ required: "New per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.newPurchasePerUnitPrice}
                    helperText={errors.newPurchasePerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="newPurchaseInventoryValue"
                control={control}
                rules={{ required: "New purchase value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Value"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.newPurchaseInventoryValue}
                    helperText={errors.newPurchaseInventoryValue?.message}
                  />
                )}
              />

              <Controller
                name="closingInventoryUnits"
                control={control}
                rules={{ required: "Closing units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Closing Inventory Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.closingInventoryUnits}
                    helperText={errors.closingInventoryUnits?.message}
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                rules={{ required: "Category required" }}
                render={({ field }) => (
                  <TextField
                    className="col-span-2"
                    {...field}
                    label="Category"
                    size="small"
                    fullWidth
                    select
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {/* Replace with your actual options */}
                    <MenuItem value="">Select category</MenuItem>
                    {department.name === "Administration"
                      ? adminCategories.map((m) => (
                          <MenuItem key={m.id} value={m.name}>
                            {m.name}
                          </MenuItem>
                        ))
                      : department.name === "Maintenance"
                      ? maintainanceCategories.map((m) => (
                          <MenuItem key={m.id} value={m.name}>
                            {m.name}
                          </MenuItem>
                        ))
                      : []}
                  </TextField>
                )}
              />

              <PrimaryButton
                title="Add Inventory"
                className="w-full col-span-2"
                type="submit"
              />
            </form>
          </div>
        )}
        {modalMode === "view" && selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3 px-2 py-4">
            {selectedAsset.image && (
              <div className="col-span-2 flex justify-center">
                <img
                  src={selectedAsset.image}
                  alt="Asset"
                  className="max-h-40 object-contain rounded-md shadow-md"
                />
              </div>
            )}
            <div className="font-bold">Item Information</div>
            <DetalisFormatted
              title="Item Name"
              detail={selectedAsset.itemName || "N/A"}
            />
            <DetalisFormatted
              title="Department"
              detail={selectedAsset.department?.name || "N/A"}
            />
            <DetalisFormatted
              title="Date"
              detail={humanDate(selectedAsset.date)}
            />
            <br />
            <div className="font-bold">Inventory Units</div>
            <DetalisFormatted
              title="Opening Units"
              detail={selectedAsset.openingInventoryUnits ?? "N/A"}
            />
            <DetalisFormatted
              title="New Purchase Units"
              detail={selectedAsset.newPurchaseUnits ?? "N/A"}
            />
            <DetalisFormatted
              title="Closing Units"
              detail={selectedAsset.closingInventoryUnits ?? "N/A"}
            />
            <br />
            <div className="font-bold">Inventory Value</div>
            <DetalisFormatted
              title="Opening Value (INR)"
              detail={`INR ${
                inrFormat(selectedAsset.openingInventoryValue) ?? "N/A"
              }`}
            />

            <DetalisFormatted
              title="New Purchase Value"
              detail={`INR ${
                inrFormat(selectedAsset.newPurchaseInventoryValue) ?? "N/A"
              }`}
            />
            <DetalisFormatted
              title="Price"
              detail={`INR ${
                inrFormat(selectedAsset.newPurchasePerUnitPrice) ?? "N/A"
              }`}
            />
            <DetalisFormatted
              title="Purchase Date"
              detail={humanDate(selectedAsset.purchaseDate)}
            />
            <br />
            <div className="font-bold">Additional Information</div>
            <DetalisFormatted
              title="Brand"
              detail={selectedAsset.brand || "N/A"}
            />

            <DetalisFormatted
              title="Quantity"
              detail={selectedAsset.quantity ?? "N/A"}
            />

            <DetalisFormatted
              title="Warranty (Months)"
              detail={selectedAsset.warranty ?? "N/A"}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default Inventory;
